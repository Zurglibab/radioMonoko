import { apiFetch } from "@/utils/apiFetch";
import {
  ContentStatusRecord,
  UpsertContentStatusPayload,
} from "@/types/content-status";

/**
 * ContentStatusService : Gestion des statuts de contenus dans la bibliothèque d'un utilisateur.
 * 
 * Couvre les opérations de récupération, définition et listing des statuts de contenus,
 * permettant aux utilisateurs d'organiser leur bibliothèque selon les statuts définis
 * côté backend (ex: "À écouter", "En cours", "Terminé", "Abandonné").
 */
export const ContentStatusService = {
  /**
   * getStatusForContent : GET /content/status/{contentId}/user/{userId}
   *
   * Récupère le statut d'un contenu pour un utilisateur donné, ou null si pas de statut.
   */
  getStatusForContent: async (
    token: string,
    contentId: string,
    userId: string
  ): Promise<ContentStatusRecord | null> => {
    try {
      return await apiFetch<ContentStatusRecord>(
        `/content/status/${contentId}/user/${userId}`,
        { token }
      );
    } catch (err: any) {
      if (err?.message?.includes('404')) return null;
      throw err;
    }
  },

  /**
   * setStatus : PUT /content/status
   *
   * Définit ou met à jour le statut d'un user sur un content. Idempotent côté backend.
   * @returns le record créé ou mis à jour.
   */
  setStatus: (
    token: string,
    payload: UpsertContentStatusPayload
  ): Promise<ContentStatusRecord> =>
    apiFetch<ContentStatusRecord>('/content/status', {
      token,
      method: 'PUT',
      body: payload,
    }),

  /**
   * getAvailableStatuses : GET /content/status/list
   *
   * Récupère la liste des statuts disponibles pour les contenus, définis côté backend.
   */
  getAvailableStatuses: (token: string): Promise<string[]> =>
    apiFetch<string[]>('/content/status/list', { token }),
};