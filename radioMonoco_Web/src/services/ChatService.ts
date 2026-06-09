import api from "./Api";
import type { Channel, Message, Member } from "../interfaces/Chat.types";

const ChatService = {
    createChannel: async (name: string, description?: string): Promise<Channel> => {
        try {
            const { data } = await api.post<Channel>(`/channels`, { name, description });
            return data;
        } catch (error) {
            console.error("Erreur création canal:", error);
            throw error;
        }
    },

    listChannels: async (): Promise<Channel[]> => {
        try {
            const { data } = await api.get<Channel[]>(`/channels`);
            return data;
        } catch (error) {
            console.error("Erreur listage canaux:", error);
            return [];
        }
    },

    getChannel: async (channelId: string): Promise<Channel> => {
        const { data } = await api.get<Channel>(`/channels/${channelId}`);
        return data;
    },

    updateChannel: async (channelId: string, name: string, description?: string): Promise<Channel> => {
        const { data } = await api.patch<Channel>(`/channels/${channelId}`, { name, description });
        return data;
    },

    deleteChannel: async (channelId: string): Promise<void> => {
        await api.delete(`/channels/${channelId}`);
    },

    addMember: async (channelId: string, userId: string): Promise<Member> => {
        const { data } = await api.post<Member>(`/channels/${channelId}/members`, { userId });
        return data;
    },

    listMembers: async (channelId: string): Promise<Member[]> => {
        const { data } = await api.get<Member[]>(`/channels/${channelId}/members`);
        return data;
    },

    removeMember: async (channelId: string, userId: string): Promise<void> => {
        await api.delete(`/channels/${channelId}/members/${userId}`);
    },

    listMessages: async (channelId: string, limit: number = 50, before?: string): Promise<Message[]> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (before) params.append('before', before);

        const { data } = await api.get<Message[]>(`/channels/${channelId}/messages?${params.toString()}`);
        return data;
    },

    sendMessage: async (channelId: string, content: string, senderId: string): Promise<Message> => {
        const { data } = await api.post<Message>(`/channels/${channelId}/messages`, { content, senderId });
        return data;
    },

    getMessage: async (channelId: string, messageId: string): Promise<Message> => {
        const { data } = await api.get<Message>(`/channels/${channelId}/messages/${messageId}`);
        return data;
    },

    updateMessage: async (channelId: string, messageId: string, content: string): Promise<Message> => {
        const { data } = await api.patch<Message>(`/channels/${channelId}/messages/${messageId}`, { content });
        return data;
    },

    deleteMessage: async (channelId: string, messageId: string): Promise<void> => {
        await api.delete(`/channels/${channelId}/messages/${messageId}`);
    }
};

export default ChatService;