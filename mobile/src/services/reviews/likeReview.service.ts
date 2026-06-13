import { apiFetch } from "@/utils/apiFetch";

export interface LikeReview {
  review_id: string;
  user_id: string;
  is_like: boolean;
  created_at?: string;
}

export const LikeReviewService = {
  upsert: (token: string, reviewId: string, userId: string, isLike: boolean): Promise<void> =>
    apiFetch<void>(`/review/${reviewId}/likes`, {
      token,
      method: 'POST',
      body: { user_id: userId, is_like: isLike },
    }),

  remove: (token: string, reviewId: string, userId: string): Promise<void> =>
    apiFetch<void>(`/review/${reviewId}/likes`, {
      token,
      method: 'DELETE',
      body: { user_id: userId },
    }),

  getByReview: (token: string, reviewId: string): Promise<LikeReview[]> =>
    apiFetch<LikeReview[]>(`/review/${reviewId}/likes`, { token }),
};
