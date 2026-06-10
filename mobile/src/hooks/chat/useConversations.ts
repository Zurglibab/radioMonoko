import { useState, useCallback, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ChannelService } from "@/services/chat/channel.service";
import { UserService } from "@/services/users/user.service";
import { isInBackoff } from "@/utils/rateLimitGuard";

export interface Conversation {
  channelId: string;
  otherUserId: string;
  otherUsername: string;
  otherAvatar?: string;
  lastMessage: string;
  lastMessageAt: string;
}

export const useConversations = () => {
  const { token, user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    if (isInBackoff()) return;
    if (!silent) setIsLoading(true);
    try {
      const channels = await ChannelService.getAll(token);

      // Traitement séquentiel par channel pour éviter un burst de requêtes simultanées
      const convs: (Conversation | null)[] = [];
      for (const channel of channels) {
        try {
          const [members, messages] = await Promise.all([
            ChannelService.getMembers(token, channel.id),
            ChannelService.getMessages(token, channel.id, 1),
          ]);

          const otherMember = members.find(m => m.user_id !== user.id);
          if (!otherMember) { convs.push(null); continue; }

          let otherUsername = "Utilisateur";
          let otherAvatar: string | undefined;
          try {
            const profile = await UserService.getById(token, otherMember.user_id);
            otherUsername = profile.display_name ?? profile.username;
            otherAvatar = profile.avatar;
          } catch {}

          const lastMsg = messages[0];
          convs.push({
            channelId: channel.id,
            otherUserId: otherMember.user_id,
            otherUsername,
            otherAvatar,
            lastMessage: lastMsg?.content ?? "",
            lastMessageAt: lastMsg?.created_at ?? channel.created_at,
          });
        } catch {
          convs.push(null);
        }
      }

      setConversations(
        convs
          .filter((c): c is Conversation => c !== null)
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      );
    } catch (err) {
      if (__DEV__) console.warn("[useConversations]", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { load(); }, [load]);

  return { conversations, isLoading, refetch: load };
};
