import { apiFetch } from "@/utils/apiFetch";
import { ContentFavorite, CreateContentFavoritePayload } from "@/types/favorite";

/**
 * FavoriteService : Gestion des favoris de contenus par les utilisateurs.
 * 
 * Couvre les opérations de récupération, ajout et suppression des favoris,
 * ainsi que la vérification de l'état de favori pour un contenu donné.
 */
export const FavoriteService = {
  /**
   * getUserFavorites : GET /content/favorites/user/{userId}
   * 
   * Récupère la liste complète des favoris d'un utilisateur, enrichie avec les
   * métadonnées de chaque contenu grâce à l'inclusion de l'objet "content".
   */
  getUserFavorites: (token: string, userId: string): Promise<ContentFavorite[]> =>
    apiFetch<ContentFavorite[]>(`/content/favorites/user/${userId}`, { token }),

  /**
   * checkIsFavorite : GET /content/favorites/{contentId}/user/{userId}
   * 
   * Vérifie si un contenu est dans les favoris de l'utilisateur. Utilisé pour
   * afficher l'état du bouton "J'aime" sur un contenu.
   */
  checkIsFavorite: async (
    token: string,
    contentId: string,
    userId: string
  ): Promise<ContentFavorite | null> => {
    try {
      return await apiFetch<ContentFavorite>(
        `/content/favorites/${contentId}/user/${userId}`,
        { token }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) return null;
      throw err;
    }
  },

  /**
   * addFavorite : POST /content/favorites
   * 
   * Ajoute un favori pour un contenu donné. Idempotent côté backend
   * (un POST répété ne crée pas de doublon, mais on guard côté hook).
   */
  addFavorite: (
    token: string,
    payload: CreateContentFavoritePayload
  ): Promise<ContentFavorite> =>
    apiFetch<ContentFavorite>('/content/favorites', {
      token,
      method: 'POST',
      body: payload,
    }),

  /**
   * removeFavorite : DELETE /content/favorites/{contentId}/user/{userId}
   * 
   * Retire un contenu des favoris de l'utilisateur. Idempotent côté backend
   * (un DELETE sur un favori non existant devrait être no-op, mais on guard côté hook).
   */
  removeFavorite: (
    token: string,
    contentId: string,
    userId: string
  ): Promise<void> =>
    apiFetch<void>(`/content/favorites/${contentId}/user/${userId}`, {
      token,
      method: 'DELETE',
    }),
};