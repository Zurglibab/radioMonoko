import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";

/**
 * useSocialStats : Hook pilotant les métriques relationnelles de l'utilisateur.
 * Interroge PostgreSQL pour récupérer le volume réel d'amis / abonnements.
 * @param skipInitialFetch Si true, désactive le fetch automatique au montage pour éviter les conflits.
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
      const friends = await SocialService.fetchMyFriends(token);
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