import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";
import { SocialActivity } from "@/types/community";

/**
 * useCommunity : Hook de gestion du fil d'actualité communautaire.
 * Ce hook centralise la logique de chargement et de gestion du feed communautaire, 
 * qui regroupe les interactions sociales (critiques, likes, commentaires) des utilisateurs.
 * Il gère l'état du feed, le chargement initial, et fournit une fonction de rafraîchissement pour recharger les données à la demande.
 * Il utilise le SocialService pour interagir avec l'API et récupérer les activités sociales à afficher dans le fil d'actualité.
 * @param skipInitialFetch 
 * @returns 
 */
export const useCommunity = (skipInitialFetch = false) => {
  const { token } = useAuthContext();
  const [feed, setFeed] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);

  const loadFeed = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await SocialService.getFeed(token);
      setFeed(Array.isArray(data) ? data : []);
    } catch (error) {
      if (__DEV__) console.warn("[useCommunity]", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (skipInitialFetch) {
      setIsLoading(false);
      return;
    }
    loadFeed();
  }, [skipInitialFetch, loadFeed]);

  return {
    feed,
    isLoading,
    refetch: loadFeed
  };
};