import { apiFetch } from "@/utils/apiFetch";
import { ReviewDTO, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";

export const ReviewService = {
  getAll: (token: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>('/review', { token }),

  getById: (token: string, id: string): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>(`/review/${id}`, { token }),

  getByContent: (token: string, contentId: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>(`/review/content/${contentId}`, { token }),

  getByParent: (token: string, parentReviewId: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>(`/review/parent/${parentReviewId}`, { token }),

  create: (token: string, payload: CreateReviewPayload): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>('/review', { token, method: 'POST', body: payload }),

  update: (token: string, id: string, payload: UpdateReviewPayload): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>(`/review/${id}`, { token, method: 'PUT', body: payload }),

  remove: (token: string, id: string): Promise<void> =>
    apiFetch<void>(`/review/${id}`, { token, method: 'DELETE' }),
};
