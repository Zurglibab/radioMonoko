import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";

/**
 * useSocialStats : Hook personnalisé pour récupérer les statistiques sociales de l'utilisateur connecté, comme le nombre d'amis.
 * Il gère le chargement des données, les erreurs d'authentification (en forçant la déconnexion si la session est expirée), et fournit une fonction de rafraîchissement des données.
 * @param skipInitialFetch 
 * @returns 
 */
export const useSocialStats = (skipInitialFetch = false) => {
  const { token, isAuthenticated, isLoading: isAuthLoading, logout } = useAuthContext();
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [isLoadingSocial, setIsLoadingSocial] = useState<boolean>(true);

  const loadSocialMetrics = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setFriendsCount(0);
      setIsLoadingSocial(false);
      return;
    }

    setIsLoadingSocial(true);
    try {
      const friends = await SocialService.fetchMyFollowing(token);
      setFriendsCount(Array.isArray(friends) ? friends.length : 0);
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        await logout();
        return;
      }
      if (__DEV__) console.warn("[useSocialStats] Erreur de chargement :", error?.message);
      setFriendsCount(0);
    } finally {
      setIsLoadingSocial(false);
    }
  }, [token, isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthLoading || skipInitialFetch) {
      if (skipInitialFetch) setIsLoadingSocial(false);
      return;
    }
    loadSocialMetrics();
  }, [isAuthLoading, skipInitialFetch, loadSocialMetrics]);

  return {
    friendsCount,
    isLoadingSocial,
    refetch: loadSocialMetrics,
  };
};