import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ReviewService } from "@/services/reviews/review.service";
import { RatingService } from "@/services/ratings/rating.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { Station } from "@/types/content";
import { isInBackoff } from "@/utils/rateLimitGuard";

export const useReviewForm = (station: Station | null) => {
  const { token, user } = useAuthContext();
  const [initialRating, setInitialRating] = useState(0);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user?.id || !station) return;
    if (isInBackoff()) return;
    setIsLoadingExisting(true);
    (async () => {
      try {
        const content = await ContentApiService.findByApiId(token, station.id);
        if (!content) {
          setInitialRating(0);
          return;
        }
        try {
          const rating = await RatingService.getByUserAndContent(token, content.id, user.id);
          setInitialRating(rating.average_rating);
        } catch {
          setInitialRating(0);
        }
      } catch {
      } finally {
        setIsLoadingExisting(false);
      }
    })();
  }, [token, user?.id, station]);

  const submit = useCallback(async (rating: number, comment: string) => {
    if (!token || !user?.id || !station) {
      throw new Error("Session invalide.");
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const contentId = await ContentApiService.resolveContentId(token, station.id, {
        title: station.title,
        description: station.description || "",
        content_type: station.type === 'podcast' ? 'podcast' : 'show',
      });

      const promises: Promise<unknown>[] = [];

      if (rating > 0) {
        promises.push(RatingService.saveRating(token, contentId, user.id, rating));
      }
      if (comment.trim().length > 0) {
        promises.push(ReviewService.create(token, {
          user_id: user.id,
          content_id: contentId,
          parent_review_id: null,
          comment: comment.trim(),
        }));
      }

      await Promise.all(promises);
    } catch (err: any) {
      const msg = err?.message || "Impossible de publier la critique.";
      setSubmitError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [token, user?.id, station]);

  return {
    initialRating,
    isLoadingExisting,
    isSubmitting,
    submitError,
    submit,
  };
};