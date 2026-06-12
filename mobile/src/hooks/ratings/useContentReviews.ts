import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ReviewService } from "@/services/reviews/review.service";
import { RatingService } from "@/services/ratings/rating.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { ReviewDTO } from "@/types/review";

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
      const content = await ContentApiService.findByApiId(token, apiId);
      if (!content) {
        setMainReviews([]);
        setAverageRating(null);
        setRatingCount(0);
        setError(null);
        return;
      }

      const [reviews, allRatings] = await Promise.all([
        ReviewService.getByContent(token, content.id),
        RatingService.getAll(token),
      ]);

      setMainReviews(reviews.filter(r => r.parent_review_id === null));

      const ratingsForContent = allRatings.filter(r => r.content_id === content.id);
      setAverageRating(RatingService.computeAverage(ratingsForContent));
      setRatingCount(ratingsForContent.length);

      setError(null);
    } catch {
      setError("Impossible de charger les critiques.");
    } finally {
      setIsLoading(false);
    }
  }, [token, apiId]);

  useEffect(() => { load(); }, [load]);

  // Séparé du chargement principal pour éviter un N+1 si l'utilisateur ne consulte pas les commentaires.
  const loadCommentsFor = useCallback(async (reviewId: string): Promise<ReviewDTO[]> => {
    if (!token) return [];
    try {
      return await ReviewService.getByParent(token, reviewId);
    } catch {
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