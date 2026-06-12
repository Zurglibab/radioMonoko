import { apiFetch } from "@/utils/apiFetch";
import {
  RatingContentDTO,
  CreateRatingPayload,
  UpdateRatingPayload,
} from "@/types/rating";

export const RatingService = {
  getAll: (token: string): Promise<RatingContentDTO[]> =>
    apiFetch<RatingContentDTO[]>('/ratingContent', { token }),

  getByUserAndContent: (
    token: string,
    contentId: string,
    userId: string
  ): Promise<RatingContentDTO> =>
    apiFetch<RatingContentDTO>(
      `/ratingContent/content/${contentId}/user/${userId}`,
      { token }
    ),

  create: (token: string, payload: CreateRatingPayload): Promise<RatingContentDTO> =>
    apiFetch<RatingContentDTO>('/ratingContent', { token, method: 'POST', body: payload }),

  update: (
    token: string,
    contentId: string,
    userId: string,
    payload: UpdateRatingPayload
  ): Promise<RatingContentDTO> =>
    apiFetch<RatingContentDTO>(
      `/ratingContent/content/${contentId}/user/${userId}`,
      { token, method: 'PUT', body: payload }
    ),

  saveRating: async (
    token: string,
    contentId: string,
    userId: string,
    rating: number
  ): Promise<RatingContentDTO> => {
    try {
      await RatingService.getByUserAndContent(token, contentId, userId);
      return RatingService.update(token, contentId, userId, { average_rating: rating });
    } catch {
      return RatingService.create(token, {
        content_id: contentId,
        user_id: userId,
        average_rating: rating,
      });
    }
  },

  computeAverage: (ratings: RatingContentDTO[]): number | null => {
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + r.average_rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  },
};
