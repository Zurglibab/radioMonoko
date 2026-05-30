import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { CollectionService } from "@/services/collections/collection.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionDTO } from "@/types/collection";
import { Station } from "@/types/content";

/**
 * useCollections : Pilote les listes personnalisées de l'utilisateur connecté.
 * Couvre les items "Listes personnalisées" et "Confidentialité" du barème.
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
   * createCollection : crée une nouvelle liste personnalisée.
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
    });
    setCollections(prev => [created, ...prev]);
    return created;
  }, [token, user?.id]);

  /**
   * renameCollection / updateCollection : modifie nom, description ou visibilité.
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

  /**
   * toggleVisibility : bascule public/privé (item "Confidentialité" du barème).
   */
  const toggleVisibility = useCallback(async (id: string) => {
    const target = collections.find(c => c.id === id);
    if (!target) return;
    return updateCollection(id, { is_public: !target.is_public });
  }, [collections, updateCollection]);

  /**
   * deleteCollection : supprime une liste entière.
   */
  const deleteCollection = useCallback(async (id: string) => {
    if (!token) return;
    // Optimiste
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
   * addStationToCollection : ajoute une station à une collection donnée.
   * Implémente le pattern "get-or-create" pour le content_id :
   * - Tente de trouver un Content existant dans le cache local avec le même api_id que la station
   * - Si trouvé, réutilise son id UUID local
   * - Sinon, crée un nouveau Content dans le cache à partir des métadonnées de la station, et utilise son nouvel id
   * Cela garantit que chaque station référencée dans une collection a un content_id valide, même si elle n'avait pas encore été ajoutée au cache local.
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
  };
};