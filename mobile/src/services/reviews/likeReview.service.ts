import { apiFetch } from "@/utils/apiFetch";

/**
 * LikeReviewCount : Modèle du nombre de likes et dislikes sur une critique.
 * Il contient le nombre total de likes, de dislikes, et le total combiné.
 * Ce modèle est utilisé pour afficher les statistiques de like/dislike sur les critiques
 * et pour calculer les ratios d'appréciation.
 */
export interface LikeReviewCount {
  likes: number;
  dislikes: number;
  total: number;
}

/**
 * LikeReview : Modèle d'un like/dislike sur une critique.
 * Il contient des informations sur l'identifiant de la critique, l'utilisateur qui a aimé ou pas,
 * et le type d'interaction (like ou dislike). Ce modèle est utilisé pour gérer les interactions
 * de like/dislike sur les critiques dans l'application.
 */
export interface LikeReview {
  review_id: string;
  user_id: string;
  is_like: boolean;
  created_at?: string;
}

/**
 * LikeReviewService : Communication avec l'API /review/{reviewId}/likes.
 * Ce service gère les interactions liées aux likes/dislikes sur les critiques, 
 * incluant la création, la suppression, et la récupération des données de like.
 * Il utilise la fonction apiFetch pour effectuer les requêtes HTTP et gère les tokens d'authentification nécessaires.
 */
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