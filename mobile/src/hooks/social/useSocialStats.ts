import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";

/**
 * useSocialStats : Hook pilotant les métriques relationnelles de l'utilisateur.
 * Interroge PostgreSQL pour récupérer le volume réel d'amis / abonnements.
 */
export const useSocialStats = () => {
  const { token, isAuthenticated, isLoading, logout } = useAuthContext();
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [isLoadingSocial, setIsLoadingSocial] = useState<boolean>(false);

  const loadSocialMetrics = useCallback(async () => {
    if (!token || !isAuthenticated) return;

    setIsLoadingSocial(true);
    try {
      const friends = await SocialService.fetchMyFriends(token);
      setFriendsCount(friends.length);
    } catch (error: any) {
      // Session expirée : on déconnecte proprement l'utilisateur
      if (error?.message?.includes("Session d'authentification expirée")) {
        await logout();
        return;
      }
      if (__DEV__) console.warn("[useSocialStats]", error?.message);
      setFriendsCount(0);
    } finally {
      setIsLoadingSocial(false);
    }
  }, [token, isAuthenticated, logout]);

  useEffect(() => {
    // Attend que le contexte d'auth ait fini de s'hydrater avant d'appeler l'API
    if (isLoading) return;
    loadSocialMetrics();
  }, [isLoading, loadSocialMetrics]);

  return {
    friendsCount,
    isLoadingSocial,
    refreshSocial: loadSocialMetrics,
  };
};