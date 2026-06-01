import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { CollectionService } from "@/services/collections/collection.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionDTO, CollectionItem } from "@/types/collection";

/**
 * useCollectionDetail : Pilote l'écran de détail d'une collection.
 *
 * Charge la collection, ses éléments, puis enrichit chaque élément avec les
 * métadonnées de son Content (N+1 fetch parallélisé). Expose les actions
 * d'ajout/retrait/mise à jour d'éléments.
 *
 * @param collectionId UUID de la collection à afficher
 */
export const useCollectionDetail = (collectionId: string) => {
  const { token } = useAuthContext();
  const [collection, setCollection] = useState<CollectionDTO | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge la collection + ses éléments enrichis.
   */
  const load = useCallback(async () => {
    if (!token || !collectionId) return;
    setIsLoading(true);
    try {
      // 1. En-tête de la collection + éléments bruts, en parallèle
      const [col, rawItems] = await Promise.all([
        CollectionService.getById(token, collectionId),
        CollectionService.getItems(token, collectionId),
      ]);
      setCollection(col);

      // 2. Enrichissement : un GET /content par élément, tous en parallèle.
      //    Un content manquant (404) ne fait pas échouer toute la liste.
      const enriched = await Promise.all(
        rawItems.map(async (item): Promise<CollectionItem> => {
          let content = null;
          try {
            content = await ContentApiService.getById(token, item.content_id);
          } catch {
            content = null; // content supprimé ou introuvable
          }
          return {
            collectionId: item.collection_id,
            contentId: item.content_id,
            position: item.position,
            note: item.note,
            createdAt: item.created_at,
            content,
          };
        })
      );

      // Tri par position pour respecter l'ordre voulu
      enriched.sort((a, b) => a.position - b.position);
      setItems(enriched);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollectionDetail]", err?.message);
      setError("Impossible de charger cette collection.");
    } finally {
      setIsLoading(false);
    }
  }, [token, collectionId]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * removeItem : retire une œuvre de la collection (optimiste).
   */
  const removeItem = useCallback(async (contentId: string) => {
    if (!token) return;
    const previous = items;
    setItems(prev => prev.filter(i => i.contentId !== contentId));
    try {
      await CollectionService.removeItem(token, collectionId, contentId);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollectionDetail] removeItem échoué, rollback", err?.message);
      setItems(previous);
    }
  }, [token, collectionId, items]);

  /**
   * updateItemNote : modifie la note associée à un élément.
   */
  const updateItemNote = useCallback(async (contentId: string, note: string) => {
    if (!token) return;
    const updated = await CollectionService.updateItem(token, collectionId, contentId, { note });
    setItems(prev => prev.map(i =>
      i.contentId === contentId ? { ...i, note: updated.note } : i
    ));
  }, [token, collectionId]);

  return {
    collection,
    items,
    isLoading,
    error,
    refetch: load,
    removeItem,
    updateItemNote,
  };
};