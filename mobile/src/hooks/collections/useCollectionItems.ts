import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { CollectionService } from "@/services/collections/collection.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionItem } from "@/types/collection";

export const useCollectionItems = (collectionId: string | null) => {
  const { token } = useAuthContext();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !collectionId) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const rawItems = await CollectionService.getItems(token, collectionId);

      const enriched = await Promise.all(
        rawItems.map(async (item): Promise<CollectionItem> => {
          let content = null;
          try {
            content = await ContentApiService.getById(token, item.content_id);
          } catch {
            content = null;
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

      enriched.sort((a, b) => a.position - b.position);
      setItems(enriched);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollectionItems]", err?.message);
      setError("Impossible de charger les éléments de cette collection.");
    } finally {
      setIsLoading(false);
    }
  }, [token, collectionId]);

  useEffect(() => {
    load();
  }, [load]);

  const removeItem = useCallback(async (contentId: string) => {
    if (!token || !collectionId) return;
    const previous = items;
    setItems(prev => prev.filter(i => i.contentId !== contentId));
    try {
      await CollectionService.removeItem(token, collectionId, contentId);
    } catch (err: any) {
      if (__DEV__) console.warn("[useCollectionItems] removeItem échoué, rollback", err?.message);
      setItems(previous);
    }
  }, [token, collectionId, items]);

  return {
    items,
    isLoading,
    error,
    removeItem,
    refetch: load,
  };
};
