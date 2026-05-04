import { Review } from "@/types/community";

/**
 * ReviewService : Gère le cycle de vie des critiques et des notations.
 * Ce service fait le pont entre les œuvres (API tierce) et les avis des 
 * utilisateurs de la plateforme RadioMonoco.
 */
export const ReviewService = {
  /**
   * getReviewsByStation : Récupère les critiques d'une œuvre spécifique.
   * Indispensable pour l'affichage de "l'espace communautaire" sur chaque fiche.
   * 
   * @param stationId - L'identifiant unique du média (Radio ou Podcast).
   * @returns Promise<Review[]> - Liste des avis formatés avec notes et commentaires.
   */
  getReviewsByStation: async (stationId: string): Promise<Review[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "r1",
            userId: "u101",
            username: "Sophie_Radio",
            stationId,
            rating: 5, // Score
            content: "Une découverte incroyable ! Le mix Jazz/Lofi est parfait pour bosser.",
            likes: 8,  // Interaction communautaire
            timestamp: new Date().toISOString(),
            comments: [] // Fil de discussion associé
          }
        ]);
      }, 600);
    });
  },

  /**
   * postReview : Publication d'un avis.
   * Action métier critique : Seuls les utilisateurs authentifiés peuvent 
   * persister un avis en base de données.
   * 
   * @param review - Objet partiel contenant la note et le texte de la critique.
   */
  postReview: async (review: Partial<Review>): Promise<void> => {
    return new Promise((resolve) => {
      // Logique de tunnelisation vers le backend
      console.log("Envoi de la critique au serveur RadioMonoco...", review);
      
      // Simulation du temps d'écriture en base de données
      setTimeout(resolve, 1000);
    });
  }
};