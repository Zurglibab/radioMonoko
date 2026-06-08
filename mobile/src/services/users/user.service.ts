import { apiFetch } from "@/utils/apiFetch";
import { Friend } from "@/types/social";

/**
 * Interface représentant la structure renvoyée par /user/me/library
 * basée sur la documentation Swagger de l'API RadioMonoko.
 */
export interface LibraryItem {
  content_id: string;
  user_id: string;
  status: string; // "à voir" | "commencer" | "fini" | "abandonné"
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
 * UserService : Recherche, consultation et gestion du compte utilisateur connecté.
 */
export const UserService = {
  /**
   * getById : GET /user/{userId}
   * Récupère le profil public d'un utilisateur par son UUID.
   */
  getById: (token: string, userId: string): Promise<PublicUserProfile> =>
    apiFetch<PublicUserProfile>(`/user/${userId}`, { token }),

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