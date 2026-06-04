import { apiFetch } from "@/utils/apiFetch";

/**
 * LikeReviewService : Gestion des likes/dislikes sur les critiques d'œuvres.
 * 
 * Couvre les interactions sociales sur les critiques, permettant aux utilisateurs
 * d'exprimer leur appréciation ou leur désaccord avec les avis de la communauté.
 */
export interface LikeReviewCount {
  likes: number;
  dislikes: number;
  total: number;
}

export const LikeReviewService = {
  upsert: (token: string, reviewId: string, userId: string, isLike: boolean): Promise<void> =>
    apiFetch<void>(`/likeReview/${reviewId}`, {
      token,
      method: 'PUT',
      body: { user_id: userId, is_like: isLike },
    }),

  remove: (token: string, reviewId: string, userId: string): Promise<void> =>
    apiFetch<void>(`/likeReview/${reviewId}`, {
      token,
      method: 'DELETE',
      body: { user_id: userId },
    }),

  getCount: (token: string, reviewId: string): Promise<LikeReviewCount> =>
    apiFetch<LikeReviewCount>(`/likeReview/${reviewId}/count`, { token }),
};
