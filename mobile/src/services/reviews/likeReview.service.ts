import { apiFetch } from "@/utils/apiFetch";

export interface LikeReviewCount {
  likes: number;
  dislikes: number;
  total: number;
}

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

  getCount: (token: string, reviewId: string): Promise<LikeReviewCount> =>
    apiFetch<LikeReviewCount>(`/review/${reviewId}/likes/count`, { token }),

  getByReview: (token: string, reviewId: string): Promise<LikeReview[]> =>
    apiFetch<LikeReview[]>(`/review/${reviewId}/likes`, { token }),
};
