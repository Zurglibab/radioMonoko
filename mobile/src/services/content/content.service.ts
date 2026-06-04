import { EnrichedStatus } from "@/hooks/content/useMyStatuses";
import { ContentFavorite } from "@/types/favorite";

/**
 * ContentService : Service de logique métier autour des contenus, combinant statuts et favoris.
 */
export const ContentService = {
  /**
   * computeUserStats : Calcule les métriques globales du Dashboard depuis
   * les vraies données utilisateur (statuts + favoris).
   */
  computeUserStats: (
    statuses: EnrichedStatus[],
    favorites: ContentFavorite[]
  ) => {
    const totalListened = statuses.filter(s => s.status === 'fini').length;
    const inProgress = statuses.filter(s => s.status === 'commencer').length;
    const toListen = statuses.filter(s => s.status === 'à voir').length;
    const dropped = statuses.filter(s => s.status === 'abandonné').length;

    return {
      totalListened,
      inProgress,
      toListen,
      dropped,
      favoritesCount: favorites.length,
      totalTracked: statuses.length,
    };
  },
};