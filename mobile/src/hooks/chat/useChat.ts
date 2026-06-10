import { useState, useCallback, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ChannelService } from "@/services/chat/channel.service";
import { UserService } from "@/services/users/user.service";
import { isInBackoff, triggerGlobalBackoff } from "@/utils/rateLimitGuard";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isMine: boolean;
  isOptimistic?: boolean;
}

const POLL_INTERVAL = 20_000;

export const useChat = (channelId: string) => {
  const { token, user } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const usernameCache = useRef<Record<string, string>>({});
  const optimisticCounter = useRef(0);

  const resolveUsername = useCallback(
    async (userId: string): Promise<string> => {
      if (userId === user?.id) return user.username ?? "Moi";
      if (usernameCache.current[userId]) return usernameCache.current[userId];
      try {
        const profile = await UserService.getById(token!, userId);
        const name = profile.display_name ?? profile.username;
        usernameCache.current[userId] = name;
        return name;
      } catch {
        return "Utilisateur";
      }
    },
    [token, user]
  );

  const load = useCallback(
    async (silent = false) => {
      if (!token || !channelId) return;
      if (isInBackoff()) return;
      if (!silent) setIsLoading(true);
      try {
        const dtos = await ChannelService.getMessages(token, channelId, 50);

        const uniqueIds = [...new Set(dtos.map(d => d.sender_id))];
        await Promise.all(uniqueIds.map(id => resolveUsername(id)));

        const mapped: ChatMessage[] = dtos
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .map(dto => ({
            id: dto.id,
            senderId: dto.sender_id,
            senderName:
              usernameCache.current[dto.sender_id] ??
              (dto.sender_id === user?.id ? (user?.username ?? "Moi") : "Utilisateur"),
            content: dto.content,
            timestamp: dto.created_at,
            isMine: dto.sender_id === user?.id,
          }));

        setMessages(prev => {
          const optimistics = prev.filter(m => m.isOptimistic);
          return [...mapped, ...optimistics];
        });
      } catch (err: any) {
        if (__DEV__) console.warn("[useChat] load failed:", err);
        if (err?.message === "HTTP 429") triggerGlobalBackoff();
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [token, channelId, resolveUsername, user]
  );

  useEffect(() => {
    if (!token || !channelId) return;
    load();
    intervalRef.current = setInterval(() => load(true), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load, token, channelId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !token || !user?.id || isSending) return;
      setIsSending(true);

      const optimisticId = `temp-${++optimisticCounter.current}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        senderId: user.id,
        senderName: user.username ?? "Moi",
        content: content.trim(),
        timestamp: new Date().toISOString(),
        isMine: true,
        isOptimistic: true,
      };
      setMessages(prev => [...prev, optimistic]);

      try {
        const sent = await ChannelService.sendMessage(
          token,
          channelId,
          content.trim(),
          user.id
        );
        // Remove optimistic first, then reload to get real message from server
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
        if (sent?.id) {
          // Update with confirmed message directly if backend returned it
          setMessages(prev => [
            ...prev,
            { ...optimistic, id: sent.id, isOptimistic: false },
          ]);
        } else {
          // Backend didn't return the full message — reload
          load(true);
        }
      } catch {
        setMessages(prev => prev.filter(m => m.id !== optimisticId));
      } finally {
        setIsSending(false);
      }
    },
    [token, channelId, user, isSending, load]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!token) return;
      setMessages(prev => prev.filter(m => m.id !== messageId));
      try {
        await ChannelService.deleteMessage(token, channelId, messageId);
      } catch {
        load(true);
      }
    },
    [token, channelId, load]
  );

  return { messages, isLoading, isSending, sendMessage, deleteMessage };
};
