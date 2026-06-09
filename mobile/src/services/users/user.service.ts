import { apiFetch } from "@/utils/apiFetch";
import { Friend } from "@/types/social";

/**
 * Types et services liés aux utilisateurs : profils publics, recherche, bibliothèque personnelle.
 * Ces types définissent les structures de données pour les profils publics et les éléments de bibliothèque.
 * Le UserService fournit des méthodes pour interagir avec les endpoints liés aux utilisateurs, comme la
 * récupération de profils publics, la recherche d'utilisateurs, et l'accès à la bibliothèque personnelle.
 */
export interface LibraryItem {
  content_id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  content: {
    id: string;
    api_id: string;
    title: string;
    description: string | null;
    content_type: string;
    created_at: string;
  };
}

export interface PublicUserProfile {
  id: string;
  username: string;
  avatar?: string;
  display_name?: string;
}

/**
 * UserService : Communication avec l'API /user.
 * Ce service centralise toutes les interactions avec les endpoints liés aux utilisateurs,
 * permettant de récupérer les profils publics, de rechercher des utilisateurs, et d'accéder à la bibliothèque
 * personnelle de l'utilisateur connecté. Il utilise la fonction apiFetch pour effectuer les requêtes HTTP
 * et gère les tokens d'authentification nécessaires.
 */
export const UserService = {
  /**
   * getById : GET /user/{userId}
   * Récupère le profil public d'un utilisateur par son UUID.
   */
  getById: (token: string, userId: string): Promise<PublicUserProfile> =>
    apiFetch<PublicUserProfile>(`/user/id/${userId}`, { token }),

  /**
   * search : GET /user/search?q=...
   * Renvoie les utilisateurs publics dont le username matche.
   * Le backend gère lui-même la confidentialité (seuls les comptes publics sortent).
   */
  search: (token: string, query: string): Promise<Friend[]> =>
    apiFetch<Friend[]>(`/user/search?q=${encodeURIComponent(query)}`, { token }),

  /**
   * getLibrary : GET /user/me/library
   * Récupère la bibliothèque complète de l'utilisateur connecté avec 
   * le statut associé pour chaque contenu (à voir, commencer, fini, abandonné).
   */
  getLibrary: (token: string): Promise<LibraryItem[]> =>
    apiFetch<LibraryItem[]>("/user/me/library", { token }),
};