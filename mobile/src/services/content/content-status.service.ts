import { apiFetch } from "@/utils/apiFetch";
import {
  ContentStatusRecord,
  UpsertContentStatusPayload,
} from "@/types/content-status";

export const ContentStatusService = {
  getStatusForContent: async (
    token: string,
    contentId: string,
    userId: string
  ): Promise<ContentStatusRecord | null> => {
    try {
      return await apiFetch<ContentStatusRecord>(
        `/content/status/${contentId}/user/${userId}`,
        { token }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) return null;
      throw err;
    }
  },

  setStatus: (
    token: string,
    payload: UpsertContentStatusPayload
  ): Promise<ContentStatusRecord> =>
    apiFetch<ContentStatusRecord>('/content/status', {
      token,
      method: 'PUT',
      body: payload,
    }),

  getAvailableStatuses: (token: string): Promise<string[]> =>
    apiFetch<string[]>('/content/status/list', { token }),
};
