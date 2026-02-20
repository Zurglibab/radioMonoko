/**
 * Interface User
 * Représente le profil utilisateur tel qu'il est stocké en base de données et utilisé au sein de l'application.
 */
export interface User {
  id: string;        // Identifiant unique uuid
  email: string;     // Adresse mail servant d'identifiant de connexion
  username: string;  // Nom d'affichage dans la communauté RadioMonoko
  avatar?: string;   // URL de l'image de profil optionnelle
}

/**
 * Interface AuthResponse
 * Définit la structure de la réponse renvoyée par le serveur après une connexion ou une inscription réussie.
 */
export interface AuthResponse {
  user: User;        // L'objet utilisateur complet
  token: string;     // Le JWT pour authentifier les requêtes futures
}