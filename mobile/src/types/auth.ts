/**
 * Interface User
 * Représente le profil utilisateur tel qu'il est stocké en base de données et utilisé au sein de l'application.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  privacy: 'public' | 'private';
  lastUsernameChange?: string;
  is_banned?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface pour le payload de mise à jour (PUT /user/me)
 */
export interface UpdateUserPayload {
  display_name?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  privacy?: "public" | "private";
}

/**
 * Interface AuthResponse
 * Définit la structure de la réponse renvoyée par le serveur après une connexion ou une inscription réussie.
 */
export interface AuthResponse {
  token: string;
}