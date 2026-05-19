import { useState, useEffect } from "react";
import { SocialService } from "@/services/community/social.service";
import { SocialActivity } from "@/types/community";

/**
 * useCommunity : Hook de gestion du flux social.
 * Centralise la logique de récupération et de rafraîchissement du fil d'actualité
 */
export const useCommunity = () => {
  // ÉTAT : Liste des activités (Critiques, Likes, Follows du réseau)
  const [feed, setFeed] = useState<SocialActivity[]>([]);
  
  // ÉTAT : Indicateur de chargement pour le feedback utilisateur
  const [isLoading, setIsLoading] = useState(true);

  /**
   * refreshFeed : Récupère les données les plus récentes auprès du service.
   * Cette fonction peut être appelée au montage ou via une action manuelle (Pull-to-refresh).
   */
  const refreshFeed = async () => {
    setIsLoading(true);
    try {
      // Appel asynchrone au service pour récupérer le flux social
      const data = await SocialService.getFeed();
      setFeed(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du flux social :", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Déclenche le chargement initial du flux dès que le composant est monté.
   */
  useEffect(() => {
    refreshFeed();
  }, []);

  return { 
    feed,          // Les activités à afficher
    isLoading,     // État de chargement
    refreshFeed    // Fonction de rafraîchissement
  };
};