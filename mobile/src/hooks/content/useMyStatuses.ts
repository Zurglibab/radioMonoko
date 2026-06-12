import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { UserService } from "@/services/users/user.service";
import { ContentDTO } from "@/types/content-api";
import { STATUS_METADATA, findStatusMetaByModel, ContentStatus } from "@/constants/library-status";
import { MediaStatus } from "@/types/content";

export interface EnrichedStatus {
  contentId: string;
  apiId: string;
  status: ContentStatus;
  frontStatus: MediaStatus;
  content: ContentDTO;
  updatedAt: string;
}

export const useMyStatuses = (skipInitialFetch = false) => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [statuses, setStatuses] = useState<EnrichedStatus[]>([]);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);

  const loadStatuses = useCallback(async (silent = false) => {
    if (!token || !user?.id) {
      setStatuses([]);
      if (!silent) setIsLoading(false);
      return;
    }

    if (!silent) setIsLoading(true);
    try {
      const libraryItems = await UserService.getLibrary(token);
      const enriched: EnrichedStatus[] = [];

      for (const item of libraryItems) {
        if (item && item.status) {
          const meta = findStatusMetaByModel(item.status);
          if (meta) {
            enriched.push({
              contentId: item.content_id || item.content?.id,
              apiId: item.content?.api_id,
              status: item.status as ContentStatus,
              frontStatus: meta.frontStatus,
              content: item.content as ContentDTO,
              updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
            });
          }
        }
      }

      setStatuses(enriched);
      setError(null);
    } catch {
      if (!silent) setError("Impossible de charger votre bibliothèque.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthLoading || skipInitialFetch) {
      if (skipInitialFetch) setIsLoading(false);
      return;
    }
    loadStatuses();
  }, [isAuthLoading, skipInitialFetch, loadStatuses]);

  const statusCounts = useMemo(() => {
    return STATUS_METADATA.map(meta => ({
      name: meta.displayName,
      slug: meta.frontStatus,
      backendStatus: meta.backendStatus,
      count: statuses.filter(s => s.status === meta.backendStatus).length,
    }));
  }, [statuses]);

  const getByFrontStatus = useCallback(
    (frontStatus: MediaStatus) => statuses.filter(s => s.frontStatus === frontStatus),
    [statuses]
  );

  return {
    statuses,
    statusCounts,
    getByFrontStatus,
    isLoading,
    error,
    refetch: loadStatuses,
  };
};