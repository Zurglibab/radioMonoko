import { apiFetch } from "@/utils/apiFetch";
import { ReviewDTO, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";

/**
 * ReviewService : Gestion des critiques d'œuvres et des commentaires.
 */
export const ReviewService = {
  /**
   * getAll : GET /review, toutes les reviews (administration / debug).
   */
  getAll: (token: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>('/review', { token }),

  /**
   * getById : GET /review/{id}, une critique par son UUID.
   */
  getById: (token: string, id: string): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>(`/review/${id}`, { token }),

  /**
   * getByContent : GET /review/content/{contentId}, toutes les reviews d'une œuvre.
   * Inclut critiques principales ET commentaires (à filtrer côté client si besoin).
   */
  getByContent: (token: string, contentId: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>(`/review/content/${contentId}`, { token }),

  /**
   * getByParent : GET /review/parent/{parentReviewId}, commentaires d'une critique.
   */
  getByParent: (token: string, parentReviewId: string): Promise<ReviewDTO[]> =>
    apiFetch<ReviewDTO[]>(`/review/parent/${parentReviewId}`, { token }),

  /**
   * create : POST /review, crée une critique ou un commentaire.
   */
  create: (token: string, payload: CreateReviewPayload): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>('/review', { token, method: 'POST', body: payload }),

  /**
   * update : PUT /review/{id}, modifie sa propre critique.
   */
  update: (token: string, id: string, payload: UpdateReviewPayload): Promise<ReviewDTO> =>
    apiFetch<ReviewDTO>(`/review/${id}`, { token, method: 'PUT', body: payload }),

  /**
   * remove : DELETE /review/{id}, supprime sa propre critique.
   */
  remove: (token: string, id: string): Promise<void> =>
    apiFetch<void>(`/review/${id}`, { token, method: 'DELETE' }),
};