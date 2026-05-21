/**
 * Interface User
 * Représente le profil utilisateur tel qu'il est stocké en base de données et utilisé au sein de l'application.
 */
export interface User {
  id: string;        // Identifiant unique uuid
  email: string;     // Adresse mail servant d'identifiant de connexion
  username: string;  // Nom d'affichage dans la communauté RadioMonoko
  avatar?: string;   // URL de l'image de profil optionnelle
  bio?: string;     // Brève description de l'utilisateur pour sa page de profil
  website?: string; // URL du site personnel ou des réseaux sociaux de l'utilisateur
  privacy: 'public' | 'private'; // Paramètre de confidentialité du profil
  lastUsernameChange?: string; // Dernier changement de pseudo
}

/**
 * Interface pour le payload de mise à jour (PUT /user/me)
 */
export interface UpdateUserPayload {
  display_name?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  privacy: 'public' | 'private';
}

/**
 * Interface AuthResponse
 * Définit la structure de la réponse renvoyée par le serveur après une connexion ou une inscription réussie.
 */
export interface AuthResponse {
  token: string;
}