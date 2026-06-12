import { apiFetch, toArray } from "@/utils/apiFetch";

export interface ChannelDTO {
  id: string;
  type: string;
  created_at: string;
}

export interface ChannelMemberDTO {
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface MessageDTO {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const ChannelService = {
  create: (token: string): Promise<ChannelDTO> =>
    apiFetch<ChannelDTO>("/channels", { token, method: "POST", body: { type: "general" } }),

  getAll: (token: string): Promise<ChannelDTO[]> =>
    apiFetch<unknown>("/channels", { token }).then(raw => toArray<ChannelDTO>(raw)),

  getById: (token: string, channelId: string): Promise<ChannelDTO> =>
    apiFetch<ChannelDTO>(`/channels/${channelId}`, { token }),

  getMembers: (token: string, channelId: string): Promise<ChannelMemberDTO[]> =>
    apiFetch<unknown>(`/channels/${channelId}/members`, { token }).then(raw =>
      toArray<ChannelMemberDTO>(raw)
    ),

  addMember: (token: string, channelId: string, userId: string): Promise<ChannelMemberDTO> =>
    apiFetch<ChannelMemberDTO>(`/channels/${channelId}/members`, {
      token,
      method: "POST",
      body: { userId },
    }),

  removeMember: (token: string, channelId: string, userId: string): Promise<void> =>
    apiFetch<void>(`/channels/${channelId}/members/${userId}`, { token, method: "DELETE" }),

  getMessages: async (token: string, channelId: string, limit = 50): Promise<MessageDTO[]> => {
    const raw = await apiFetch<unknown>(
      `/channels/${channelId}/messages?limit=${limit}`,
      { token }
    );
    return toArray<MessageDTO>(raw);
  },

  sendMessage: (
    token: string,
    channelId: string,
    content: string,
    senderId: string
  ): Promise<MessageDTO> =>
    apiFetch<MessageDTO>(`/channels/${channelId}/messages`, {
      token,
      method: "POST",
      body: { content, senderId },
    }),

  deleteMessage: (token: string, channelId: string, messageId: string): Promise<void> =>
    apiFetch<void>(`/channels/${channelId}/messages/${messageId}`, {
      token,
      method: "DELETE",
    }),

  editMessage: (
    token: string,
    channelId: string,
    messageId: string,
    content: string
  ): Promise<MessageDTO> =>
    apiFetch<MessageDTO>(`/channels/${channelId}/messages/${messageId}`, {
      token,
      method: "PATCH",
      body: { content },
    }),

  getOrCreateDM: async (
    token: string,
    myUserId: string,
    targetUserId: string
  ): Promise<string> => {
    const channels = await ChannelService.getAll(token);
    for (const channel of channels) {
      const members = await ChannelService.getMembers(token, channel.id);
      const ids = members.map(m => m.user_id);
      if (ids.includes(myUserId) && ids.includes(targetUserId)) return channel.id;
    }
    const newChannel = await ChannelService.create(token);
    await Promise.all([
      ChannelService.addMember(token, newChannel.id, myUserId),
      ChannelService.addMember(token, newChannel.id, targetUserId),
    ]);
    return newChannel.id;
  },
};
