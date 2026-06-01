import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { CollectionService } from "@/services/collections/collection.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionDTO } from "@/types/collection";
import { Station, MediaStatus } from "@/types/content";
import {
  SYSTEM_COLLECTIONS,
  findSystemMeta,
  isSystemCollection,
} from "@/constants/library-status";

/**
 * useCollections : Hook de gestion des collections d'utilisateurs (bibliothèque).
 * 
 * Ce hook centralise la logique de chargement, création, mise à jour et suppression des collections,
 * ainsi que les opérations spécifiques liées aux collections système (À écouter, En cours, etc.) et à l'ajout d'œuvres (Stations).
 * Il fait le lien entre les statuts front (MediaStatus) et backend (BackendCollectionStatus) grâce aux métadonnées définies dans library-status.ts.
 */
export const useCollections = () => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge toutes les collections de l'utilisateur connecté.
   */
  const loadCollections = useCallback(async () => {
    if (!token || !user?.id) return;
    setIsLoading(true);
    try {
      const data = await CollectionService.getUserCollections(token, user.id);
      setCollections(data);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections]", err?.message);
      setError("Impossible de charger vos collections.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthLoading) return;
    loadCollections();
  }, [isAuthLoading, loadCollections]);

  /**
   * Sépare collections système et personnalisées (mémoïsé pour éviter les recalculs).
   */
  const { systemCollections, customCollections } = useMemo(() => ({
    systemCollections: collections.filter(c => isSystemCollection(c.status)),
    customCollections: collections.filter(c => !isSystemCollection(c.status)),
  }), [collections]);

  /**
   * createCollection : crée une nouvelle liste personnalisée (status null).
   */
  const createCollection = useCallback(async (
    name: string,
    description: string,
    isPublic: boolean
  ) => {
    if (!token || !user?.id) return;
    const created = await CollectionService.create(token, {
      user_id: user.id,
      name,
      description,
      is_public: isPublic,
      status: null,
    });
    setCollections(prev => [created, ...prev]);
    return created;
  }, [token, user?.id]);

  /**
   * updateCollection : modifie nom, description, visibilité d'une collection.
   */
  const updateCollection = useCallback(async (
    id: string,
    payload: { name?: string; description?: string; is_public?: boolean }
  ) => {
    if (!token) return;
    const updated = await CollectionService.update(token, id, payload);
    setCollections(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  }, [token]);

  const toggleVisibility = useCallback(async (id: string) => {
    const target = collections.find(c => c.id === id);
    if (!target) return;
    return updateCollection(id, { is_public: !target.is_public });
  }, [collections, updateCollection]);

  const deleteCollection = useCallback(async (id: string) => {
    if (!token) return;
    const previous = collections;
    setCollections(prev => prev.filter(c => c.id !== id));
    try {
      await CollectionService.remove(token, id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollections] delete échoué, rollback", err?.message);
      setCollections(previous);
    }
  }, [token, collections]);

  /**
   * ensureSystemCollection : garantit l'existence d'une collection système pour un statut donné, 
   * en la créant à la volée si nécessaire.
   */
  const ensureSystemCollection = useCallback(async (status: MediaStatus): Promise<CollectionDTO> => {
    if (!token || !user?.id) throw new Error("Utilisateur non connecté.");

    const meta = findSystemMeta(status);
    if (!meta) throw new Error(`Statut inconnu : ${status}`);

    // Cherche dans le cache local
    const existing = collections.find(c => c.status === meta.backendStatus);
    if (existing) return existing;

    // Crée la collection système
    const created = await CollectionService.create(token, {
      user_id: user.id,
      name: meta.displayName,
      description: meta.description,
      is_public: false,
      status: meta.backendStatus,
    });
    setCollections(prev => [...prev, created]);
    return created;
  }, [token, user?.id, collections]);

  /**
   * addStationToCollection : ajoute une œuvre (Station) à une collection.
   * Orchestre le get-or-create du Content avant l'ajout.
   */
  const addStationToCollection = useCallback(async (
    collectionId: string,
    station: Station,
    note = ""
  ) => {
    if (!token) return;
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
  }, [token]);

  /**
   * markStationAsStatus : marque une Station avec un statut donné (ex: "Terminé"), 
   * en gérant les collections système de manière exclusive.
   */
  const markStationAsStatus = useCallback(async (
    station: Station,
    status: MediaStatus
  ): Promise<void> => {
    if (!token) return;

    // Résout le content_id (UUID local) à partir de la Station
    const contentId = await ContentApiService.resolveContentId(token, station.id, {
      title: station.title,
      description: station.description || "",
      content_type: station.type === 'podcast' ? 'podcast' : 'show',
    });

    // Garantit l'existence de la collection système cible
    const targetCollection = await ensureSystemCollection(status);

    // Retire l'œuvre des autres collections système (en parallèle, échec silencieux)
    const otherSystemCollections = collections.filter(
      c => isSystemCollection(c.status) && c.id !== targetCollection.id
    );
    await Promise.all(
      otherSystemCollections.map(c =>
        CollectionService.removeItem(token, c.id, contentId).catch(() => {
          // Si l'item n'était pas dans cette collection (404), on ignore. Comportement attendu.
        })
      )
    );

    // Ajoute à la collection cible (catch silencieux si déjà présente)
    try {
      await CollectionService.addItem(token, {
        collection_id: targetCollection.id,
        content_id: contentId,
        position: 0,
        note: "",
      });
    } catch (err: any) {
      if (__DEV__) console.warn("[markStationAsStatus] addItem :", err?.message);
    }
  }, [token, collections, ensureSystemCollection]);

  /**
   * getStatusCountsAsync : récupère le nombre d'items dans chaque collection système, en parallèle.
   */
  const getStatusCountsAsync = useCallback(async () => {
    if (!token) return SYSTEM_COLLECTIONS.map(s => ({ ...s, count: 0 }));

    const results = await Promise.all(
      SYSTEM_COLLECTIONS.map(async (meta) => {
        const col = collections.find(c => c.status === meta.backendStatus);
        if (!col) return { ...meta, count: 0 };
        try {
          const items = await CollectionService.getItems(token, col.id);
          return { ...meta, count: items.length };
        } catch {
          return { ...meta, count: 0 };
        }
      })
    );
    return results;
  }, [token, collections]);

  return {
    collections,
    customCollections,
    systemCollections,
    isLoading,
    error,
    refetch: loadCollections,
    createCollection,
    updateCollection,
    toggleVisibility,
    deleteCollection,
    addStationToCollection,
    markStationAsStatus,
    ensureSystemCollection,
    getStatusCountsAsync,
  };
};