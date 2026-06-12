import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";
import { SocialActivity } from "@/types/community";
import { isInBackoff } from "@/utils/rateLimitGuard";

export const useCommunity = (skipInitialFetch = false) => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [feed, setFeed] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);
  const loadedForSession = useRef(false);

  const loadFeed = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    if (isInBackoff()) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await SocialService.getFeed(token, user.id);
      setFeed(Array.isArray(data) ? data : []);
    } catch {
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (skipInitialFetch) {
      setIsLoading(false);
      return;
    }
    if (isAuthLoading || !token || !user?.id) {
      if (!token) loadedForSession.current = false;
      return;
    }
    if (loadedForSession.current) return;
    loadedForSession.current = true;
    loadFeed();
  }, [skipInitialFetch, isAuthLoading, token, user?.id, loadFeed]);

  return {
    feed,
    isLoading,
    refetch: loadFeed,
  };
};