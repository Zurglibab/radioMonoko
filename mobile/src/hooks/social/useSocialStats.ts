import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";

export const useSocialStats = (skipInitialFetch = false) => {
  const { token, isAuthenticated, isLoading: isAuthLoading, logout } = useAuthContext();
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [isLoadingSocial, setIsLoadingSocial] = useState<boolean>(!skipInitialFetch);

  const loadSocialMetrics = useCallback(async (silent = false) => {
    if (!token || !isAuthenticated) {
      setFriendsCount(0);
      setFollowersCount(0);
      if (!silent) setIsLoadingSocial(false);
      return;
    }

    if (!silent) setIsLoadingSocial(true);
    try {
      const [following, followers] = await Promise.all([
        SocialService.fetchMyFollowing(token),
        SocialService.fetchMyFollowers(token),
      ]);
      setFriendsCount(Array.isArray(following) ? following.length : 0);
      setFollowersCount(Array.isArray(followers) ? followers.length : 0);
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        await logout();
        return;
      }
      setFriendsCount(0);
      setFollowersCount(0);
    } finally {
      if (!silent) setIsLoadingSocial(false);
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
    followersCount,
    isLoadingSocial,
    refetch: loadSocialMetrics,
  };
};