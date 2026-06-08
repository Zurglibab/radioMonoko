import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { CollectionService } from "@/services/collections/collection.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionDTO, CollectionItemDTO } from "@/types/collection";
import { Station } from "@/types/content";

/**
 * useCollections : Pilote les collections et leurs éléments pour l'utilisateur connecté.
 * @param skipInitialFetch Si true, désactive le chargement automatique au montage pour éviter les conflits
 */
export const useCollections = (skipInitialFetch = false) => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async (silent = false) => {
    if (!token || !user?.id) {
      setCollections([]);
      if (!silent) setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const data = await CollectionService.getUserCollections(token, user.id);
      // Filtre défensif : ne garder que les collections appartenant à cet utilisateur
      // (protection si le backend retourne des collections publiques d'autres users)
      setCollections(data.filter(c => c.user_id === user.id));
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections] load error:", err?.message);
      if (!silent) setError("Impossible de charger vos collections.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthLoading || skipInitialFetch) {
      if (skipInitialFetch) setIsLoading(false);
      return;
    }
    loadCollections();
  }, [isAuthLoading, skipInitialFetch, loadCollections]);

  // Créer une collection (POST /collections)
  const createCollection = useCallback(async (
    name: string,
    description: string,
    isPublic: boolean
  ) => {
    if (!token || !user?.id) return;
    try {
      const created = await CollectionService.create(token, {
        user_id: user.id,
        name,
        description,
        is_public: isPublic,
        status: "public_list",
      });

      const freshData = await CollectionService.getUserCollections(token, user.id);
      setCollections(freshData);

      return created;
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections] create error:", err?.message);
      throw err;
    }
  }, [token, user?.id]);

  // Mettre à jour (PUT /collections/{id})
  const updateCollection = useCallback(async (
    id: string,
    payload: { name?: string; description?: string; is_public?: boolean; status?: string }
  ) => {
    if (!token) return;
    try {
      const updated = await CollectionService.update(token, id, payload);
      setCollections(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections] update error:", err?.message);
      throw err;
    }
  }, [token]);

  // Basculer Public / Privé
  const toggleVisibility = useCallback(async (id: string) => {
    const target = collections.find(c => c.id === id);
    if (!target) return;
    return updateCollection(id, { is_public: !target.is_public });
  }, [collections, updateCollection]);

  // Supprimer (DELETE /collections/{id})
  const deleteCollection = useCallback(async (id: string) => {
    if (!token) return;
    const previous = collections;
    setCollections(prev => prev.filter(c => c.id !== id));
    
    try {
      await CollectionService.remove(token, id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections] delete failed, rolling back", err?.message);
      setCollections(previous);
      throw err;
    }
  }, [token, collections]);

  const addStationToCollection = useCallback(async (
    collectionId: string,
    station: Station,
    note = ""
  ): Promise<CollectionItemDTO | undefined> => {
    if (!token || !user?.id) return;

    const contentId = await ContentApiService.resolveContentId(token, station.id, {
      title: station.title,
      description: station.description || "",
      content_type: station.type === 'podcast' ? 'podcast' : 'show',
    });

    return CollectionService.addItem(token, {
      collection_id: collectionId,
      content_id: contentId,
      position: 0,
      note,
    });
  }, [token, user?.id]);

  const removeStationFromCollection = useCallback(async (
    collectionId: string,
    contentId: string
  ): Promise<CollectionItemDTO | undefined> => {
    if (!token) return;
    return CollectionService.removeItem(token, collectionId, contentId);
  }, [token]);

  return {
    collections,
    isLoading,
    error,
    refetch: loadCollections,
    createCollection,
    updateCollection,
    toggleVisibility,
    deleteCollection,
    addStationToCollection,
    removeStationFromCollection,
  };
};