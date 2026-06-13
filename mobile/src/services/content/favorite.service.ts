import { apiFetch } from "@/utils/apiFetch";
import { ContentFavorite, CreateContentFavoritePayload } from "@/types/favorite";

export const FavoriteService = {
  getUserFavorites: (token: string, userId: string): Promise<ContentFavorite[]> =>
    apiFetch<ContentFavorite[]>(`/content/favorites/user/${userId}`, { token }),

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
