import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatService from '../services/ChatService';
import type { Message as ChatMessage } from '../interfaces/Chat.types';

export const useChat = (channelId: string, userId: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        const socket = io('/', {
            auth: { userId },
            transports: ['websocket'],
            path: '/socket.io'
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('newMessage', (msg: ChatMessage) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m.id === msg.id);
                const tempIndex = prev.findIndex(m => m.status === 'sending' && m.content === msg.content);

                if (exists) {
                    return prev.map((m) => (m.id === msg.id ? { ...msg, status: 'sent' } : m));
                } else if (tempIndex !== -1) {
                    const newArr = [...prev];
                    newArr[tempIndex] = { ...msg, status: 'sent' };
                    return newArr;
                }
                return [...prev, { ...msg, status: 'sent' }];
            });
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [userId]);

    useEffect(() => {
        if (!socketRef.current || !channelId) return;
        socketRef.current.emit('joinChannel', channelId);
        setMessages([]);
        fetchHistory(true);
    }, [channelId]);

    const fetchHistory = useCallback(async (isInitial = false) => {
        if (isLoading || (!hasMore && !isInitial)) return;

        setIsLoading(true);
        const oldestTs = isInitial ? undefined : messages[0]?.created_at;

        try {
            const data = await ChatService.listMessages(channelId, 50, oldestTs);
            const newMessages = Array.isArray(data)
                ? data
                : (data && Array.isArray((data as any).data) ? (data as any).data : []);

            setMessages((prev) => isInitial ? newMessages : [...newMessages, ...prev]);
            setHasMore(newMessages.length >= 50);
        } catch (err) {
            console.error("Erreur historique:", err);
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [channelId, messages, isLoading, hasMore]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const tempMessage: ChatMessage = {
            channelId: channelId,
            id: tempId,
            content,
            sender_id: userId,
            created_at: new Date().toISOString(),
            status: 'sending'
        };

        setMessages((prev) => [...prev, tempMessage]);

        try {
            await ChatService.sendMessage(channelId, content, userId);
        } catch (err) {
            console.error("Erreur envoi:", err);
            setMessages((prev) =>
                prev.map((msg) => msg.id === tempId ? { ...msg, status: 'error' } : msg)
            );
        }
    }, [channelId, userId]);

    const removeMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }, []);

    return {
        messages,
        isConnected,
        sendMessage,
        removeMessage,
        fetchHistory,
        isLoading,
        hasMore
    };
};