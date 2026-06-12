import { apiFetch } from "@/utils/apiFetch";
import { ContentFavorite, CreateContentFavoritePayload } from "@/types/favorite";

export const FavoriteService = {
  getUserFavorites: (token: string, userId: string): Promise<ContentFavorite[]> =>
    apiFetch<ContentFavorite[]>(`/content/favorites/user/${userId}`, { token }),

  checkIsFavorite: async (
    token: string,
    contentId: string,
    userId: string
  ): Promise<ContentFavorite | null> => {
    try {
      return await apiFetch<ContentFavorite>(
        `/content/favorites/${contentId}/user/${userId}`,
        { token }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) return null;
      throw err;
    }
  },

  addFavorite: (
    token: string,
    payload: CreateContentFavoritePayload
  ): Promise<ContentFavorite> =>
    apiFetch<ContentFavorite>('/content/favorites', {
      token,
      method: 'POST',
      body: payload,
    }),

  removeFavorite: (
    token: string,
    contentId: string,
    userId: string
  ): Promise<void> =>
    apiFetch<void>(`/content/favorites/${contentId}/user/${userId}`, {
      token,
      method: 'DELETE',
    }),
};
