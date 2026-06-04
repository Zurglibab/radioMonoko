import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { FavoriteService } from "@/services/content/favorite.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { ContentFavorite } from "@/types/favorite";
import { Station, BackendContent } from "@/types/content";

/**
 * useFavorites : Hook de gestion des favoris de contenus pour l'utilisateur connecté.
 * 
 * Ce hook centralise la logique de récupération, enrichissement et manipulation des favoris
 * de l'utilisateur. Il gère l'état de chargement, les erreurs, et fournit une fonction
 * toggleFavorite pour ajouter ou retirer un contenu des favoris de manière optimiste.
 * @param skipInitialFetch 
 * @returns 
 */
export const useFavorites = (skipInitialFetch = false) => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [favorites, setFavorites] = useState<ContentFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(!skipInitialFetch);
  const [error, setError] = useState<string | null>(null);

  const favoriteContentIds = useMemo(
    () => new Set(favorites.map(f => f.content_id)),
    [favorites]
  );

  const loadFavorites = useCallback(async (silent = false) => {
    if (!token || !user?.id) {
      setFavorites([]);
      if (!silent) setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    try {
      const [list, allContent] = await Promise.all([
        FavoriteService.getUserFavorites(token, user.id),
        ContentApiService.getAll(token),
      ]);
      const contentMap = new Map(allContent.map(c => [c.id, c]));
      const enriched: ContentFavorite[] = list.map(fav => {
        const raw = contentMap.get(fav.content_id);
        return {
          ...fav,
          content: raw
            ? {
                id: raw.id,
                api_id: raw.api_id,
                title: raw.title,
                description: raw.description ?? null,
                content_type: raw.content_type as BackendContent['content_type'],
                created_at: raw.created_at,
              }
            : fav.content,
        };
      });
      setFavorites(enriched);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useFavorites] load échoué :", err?.message);
      if (!silent) setError("Impossible de charger vos favoris.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthLoading || skipInitialFetch) {
      if (skipInitialFetch) setIsLoading(false);
      return;
    }
    loadFavorites();
  }, [isAuthLoading, skipInitialFetch, loadFavorites]);

  const isFavoriteByContentId = useCallback(
    (contentId: string) => favoriteContentIds.has(contentId),
    [favoriteContentIds]
  );

  const toggleFavorite = useCallback(async (station: Station): Promise<boolean> => {
    if (!token || !user?.id) throw new Error("Utilisateur non connecté.");

    const contentTypeMapped = station.type === 'podcast' ? 'podcast' : 'show';

    const contentId = await ContentApiService.resolveContentId(token, station.id, {
      title: station.title,
      description: station.description || "",
      content_type: contentTypeMapped,
    });

    const wasAlreadyFavorite = favoriteContentIds.has(contentId);
    const previous = favorites;

    if (wasAlreadyFavorite) {
      setFavorites(prev => prev.filter(f => f.content_id !== contentId));
    } else {
      const optimistic: ContentFavorite = {
        content_id: contentId,
        user_id: user.id,
        created_at: new Date().toISOString(),
        content: {
          id: contentId,
          api_id: station.id,
          title: station.title,
          description: station.description || "",
          content_type: contentTypeMapped,
          created_at: new Date().toISOString()
        }
      };
      setFavorites(prev => [optimistic, ...prev]);
    }

    try {
      if (wasAlreadyFavorite) {
        await FavoriteService.removeFavorite(token, contentId, user.id);
        return false;
      } else {
        const created = await FavoriteService.addFavorite(token, {
          content_id: contentId,
          user_id: user.id,
        });
        
        const enrichedCreated: ContentFavorite = {
          ...created,
          content: created.content || {
            id: contentId,
            api_id: station.id,
            title: station.title,
            description: station.description || "",
            content_type: contentTypeMapped,
            created_at: created.created_at || new Date().toISOString()
          }
        };

        setFavorites(prev => prev.map(f => f.content_id === contentId ? enrichedCreated : f));
        return true;
      }
    } catch (err: any) {
      setFavorites(previous);
      throw err;
    }
  }, [token, user?.id, favorites, favoriteContentIds]);

  return {
    favorites,
    favoriteContentIds,
    isLoading,
    error,
    isFavoriteByContentId,
    toggleFavorite,
    refetch: loadFavorites,
  };
};