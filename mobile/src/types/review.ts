/**
 * ReviewDTO, Représente une critique ou un commentaire de critique.
 */
export interface ReviewDTO {
  id: string;
  user_id: string;
  content_id: string;
  parent_review_id: string | null;
  comment: string;
  created_at: string;
  featured?: boolean;
  is_featured?: boolean;
}

/**
 * CreateReviewPayload : Body de POST /review.
 * parent_review_id null pour une critique principale, sinon UUID pour un commentaire.
 */
export interface CreateReviewPayload {
  user_id: string;
  content_id: string;
  parent_review_id: string | null;
  comment: string;
}

/**
 * UpdateReviewPayload : Body de PUT /review/{id}.
 */
export interface UpdateReviewPayload {
  parent_review_id?: string | null;
  comment?: string;
}