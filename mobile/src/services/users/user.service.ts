import { apiFetch } from "@/utils/apiFetch";
import { Friend } from "@/types/social";

/**
 * UserService : Recherche et consultation des utilisateurs publics.
 */
export const UserService = {
  /**
   * search : GET /user/search?q=...
   * Renvoie les utilisateurs publics dont le username matche.
   * Le backend gère lui-même la confidentialité (seuls les comptes publics sortent).
   */
  search: (token: string, query: string): Promise<Friend[]> =>
    apiFetch<Friend[]>(`/user/search?q=${encodeURIComponent(query)}`, { token }),
};