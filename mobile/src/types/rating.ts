/**
 * RatingContentDTO, Représente la note moyenne d'un contenu donnée par les utilisateurs.
 */
export interface RatingContentDTO {
  content_id: string;
  user_id: string;
  average_rating: number; // 1 à 5
}

/**
 * CreateRatingPayload : Body de POST /ratingContent, première notation par cet user sur ce content.
 * Échoue si une notation existe déjà pour ce couple (utiliser update à la place).
 */
export interface CreateRatingPayload {
  content_id: string;
  user_id: string;
  average_rating: number;
}

/**
 * UpdateRatingPayload : Body de PUT /ratingContent/content/{contentId}/user/{userId}, modifie une notation existante.
 */
export interface UpdateRatingPayload {
  average_rating: number;
}