import { BackendContent } from "./content";

/**
 * ContentFavorite : Favori d'un utilisateur sur un contenu précis.
 *
 * Clé composite (content_id, user_id), un user peut favoriser un contenu une seule fois.
 * Renvoyé par GET /content/favorites/user/{userId} et GET /content/favorites/{contentId}/user/{userId}
 */
export interface ContentFavorite {
  content_id: string;
  user_id: string;
  created_at: string;
  content?: BackendContent;
}

/**
 * Payload de création d'un favori.
 * POST /content/favorites
 */
export interface CreateContentFavoritePayload {
  content_id: string;
  user_id: string;
}