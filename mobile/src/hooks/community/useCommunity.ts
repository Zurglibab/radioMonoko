import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/community/social.service";
import { SocialActivity } from "@/types/community";

/**
 * useCommunity : Hook de gestion du flux social.
 * @param skipInitialFetch Si true, désactive le fetch automatique au montage
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