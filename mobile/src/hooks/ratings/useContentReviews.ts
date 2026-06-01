import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ReviewService } from "@/services/reviews/review.service";
import { RatingService } from "@/services/ratings/rating.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { ReviewDTO } from "@/types/review";

/**
 * useContentReviews : Hook de chargement des critiques et notations d'un contenu.
 */
export const useContentReviews = (apiId: string | null) => {
  const { token } = useAuthContext();
  const [mainReviews, setMainReviews] = useState<ReviewDTO[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !apiId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Résous l'apiId en content_id local. Si le content n'existe pas (404), on considère qu'il n'y a ni critiques ni notations.
      const content = await ContentApiService.findByApiId(token, apiId);
      if (!content) {
        setMainReviews([]);
        setAverageRating(null);
        setRatingCount(0);
        setError(null);
        return;
      }

      // Charge en parallèle les critiques principales et toutes les notations (pour calcul de la moyenne)
      const [reviews, allRatings] = await Promise.all([
        ReviewService.getByContent(token, content.id),
        RatingService.getAll(token),
      ]);

      // Filtre les critiques principales (parent_review_id = null)
      setMainReviews(reviews.filter(r => r.parent_review_id === null));

      // Filtre les notations de ce content et calcule la moyenne + le nombre de notations
      const ratingsForContent = allRatings.filter(r => r.content_id === content.id);
      setAverageRating(RatingService.computeAverage(ratingsForContent));
      setRatingCount(ratingsForContent.length);

      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useContentReviews]", err?.message);
      setError("Impossible de charger les critiques.");
    } finally {
      setIsLoading(false);
    }
  }, [token, apiId]);

  useEffect(() => { load(); }, [load]);

  /**
   * loadCommentsFor : Charge les commentaires d'une critique donnée (parent_review_id = id de la critique).
   * Les commentaires sont des reviews avec parent_review_id non-null pointant vers la critique parente.
   * Séparé de la charge principale pour éviter le N+1 inutile si l'utilisateur ne consulte pas les commentaires.
   */
  const loadCommentsFor = useCallback(async (reviewId: string): Promise<ReviewDTO[]> => {
    if (!token) return [];
    try {
      return await ReviewService.getByParent(token, reviewId);
    } catch (err: any) {
      if (__DEV__) console.warn("[useContentReviews] comments", err?.message);
      return [];
    }
  }, [token]);

  return {
    mainReviews,
    averageRating,
    ratingCount,
    isLoading,
    error,
    refetch: load,
    loadCommentsFor,
  };
};