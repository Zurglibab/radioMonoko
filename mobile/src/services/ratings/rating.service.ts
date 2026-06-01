import { apiFetch } from "@/utils/apiFetch";
import {
  RatingContentDTO,
  CreateRatingPayload,
  UpdateRatingPayload,
} from "@/types/rating";

/**
 * RatingService : Gestion des notations utilisateur sur les contenus.
 */
export const RatingService = {
  /**
   * getAll : GET /ratingContent, toutes les notations (administration / debug).
   */
  getAll: (token: string): Promise<RatingContentDTO[]> =>
    apiFetch<RatingContentDTO[]>('/ratingContent', { token }),

  /**
   * getByUserAndContent : GET /ratingContent/content/{contentId}/user/{userId}.
   * Renvoie la notation d'un user sur un content précis (404 si pas notée).
   */
  getByUserAndContent: (
    token: string,
    contentId: string,
    userId: string
  ): Promise<RatingContentDTO> =>
    apiFetch<RatingContentDTO>(
      `/ratingContent/content/${contentId}/user/${userId}`,
      { token }
    ),

  /**
   * create : POST /ratingContent, première notation par cet user sur ce content.
   * Échoue si une notation existe déjà pour ce couple (utiliser update à la place).
   */
  create: (token: string, payload: CreateRatingPayload): Promise<RatingContentDTO> =>
    apiFetch<RatingContentDTO>('/ratingContent', { token, method: 'POST', body: payload }),

  /**
   * update : PUT /ratingContent/content/{contentId}/user/{userId}, modifie une notation existante.
   */
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

  /**
   * remove : DELETE /ratingContent/content/{contentId}/user/{userId}.
   */
  remove: (
    token: string,
    contentId: string,
    userId: string
  ): Promise<void> =>
    apiFetch<void>(
      `/ratingContent/content/${contentId}/user/${userId}`,
      { token, method: 'DELETE' }
    ),

  /**
   * saveRating : Upsert d'une notation. Crée si aucune notation existante pour ce couple (content_id, user_id), sinon met à jour.
   */
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

  /**
   * computeAverage : Calcule la moyenne d'une œuvre à partir d'une liste de notations.
   * Retourne null si aucune notation.
   */
  computeAverage: (ratings: RatingContentDTO[]): number | null => {
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + r.average_rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // arrondi à 1 décimale
  },
};