import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ContentStatusService } from "@/services/content/content-status.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { Station, MediaStatus } from "@/types/content";
import { findStatusMeta, findStatusMetaByModel } from "@/constants/library-status";

/**
 * useContentStatus : Hook de gestion du statut d'un contenu pour l'utilisateur connecté.
 * 
 * Ce hook permet de récupérer et de mettre à jour le statut d'un contenu (ex: "À écouter", "Écouté", etc.)
 * dans la bibliothèque de l'utilisateur. Il gère l'état de chargement, les erreurs, et fournit une fonction
 * setStatus pour modifier le statut de manière optimiste.
 * @param apiId 
 * @returns 
 */
export const useContentStatus = (apiId: string | null) => {
  const { token, user } = useAuthContext();
  const [currentStatus, setCurrentStatus] = useState<MediaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    if (!token || !user?.id || !apiId) {
      setCurrentStatus(null);
      return;
    }
    setIsLoading(true);
    try {
      const content = await ContentApiService.findByApiId(token, apiId);
      if (!content) {
        setCurrentStatus(null);
        return;
      }

      const record = await ContentStatusService.getStatusForContent(
        token, content.id, user.id
      );
      
      const meta = findStatusMetaByModel(record?.status);
      setCurrentStatus(meta?.frontStatus ?? null);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useContentStatus] load error :", err?.message);
      setError("Impossible de charger le statut.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id, apiId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const setStatus = useCallback(async (
    station: Station,
    status: MediaStatus
  ): Promise<void> => {
    if (!token || !user?.id) throw new Error("Utilisateur non connecté.");

    const meta = findStatusMeta(status);
    if (!meta) throw new Error(`Statut inconnu : ${status}`);

    const contentId = await ContentApiService.resolveContentId(token, station.id, {
      title: station.title,
      description: station.description || "",
      content_type: station.type === 'podcast' ? 'podcast' : 'show',
    });

    await ContentStatusService.setStatus(token, {
      content_id: contentId,
      user_id: user.id,
      status: meta.backendStatus,
    });

    setCurrentStatus(status);
  }, [token, user?.id]);

  return {
    currentStatus,
    isLoading,
    error,
    setStatus,
    refetch: loadStatus,
  };
};