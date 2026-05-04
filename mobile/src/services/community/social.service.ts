import { SocialActivity } from "@/types/community";

/**
 * SocialService : Moteur du flux d'activité communautaire.
 * Ce service centralise la récupération des interactions sociales du réseau (Follows).
 * Il respecte le principe de tri chronologique inverse pour le fil d'actualité.
 */
export const SocialService = {
  /**
   * getFeed : Récupère les dernières activités des abonnements de l'utilisateur.
   * Agrège différents types d'actions (Critiques détaillées, Notes simples).
   * 
   * @returns Promise<SocialActivity[]> - Liste des activités formatées pour le feed.
   */
  getFeed: async (): Promise<SocialActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "act_1",
            user: "Marc",
            type: "REVIEW",
            targetMedia: "Jazz Night",
            text: "La sélection Bebop était parfaite. Un vrai régal pour mes oreilles !",
            value: 4, // Note associée
            timestamp: "Il y a 10m",
            likes: 24,
            commentsCount: 8
          },
          {
            id: "act_2",
            user: "Sophie",
            type: "RATING",
            targetMedia: "FIP Metal",
            value: 5,
            timestamp: "Il y a 1h",
            likes: 12,
            commentsCount: 2
          }
        ]);
      }, 800);
    });
  },

  /**
   * toggleLike : Permet d'aimer ou de retirer son j'aime sur une activité.
   * 
   * @param activityId - L'ID de l'activité à liker.
   * @returns Promise<boolean> - Confirmation du succès de l'action.
   */
  toggleLike: async (activityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log(`[Social] Toggle like sur l'activité : ${activityId}`);
      setTimeout(() => resolve(true), 300);
    });
  }
};