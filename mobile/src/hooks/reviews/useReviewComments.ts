import { useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ReviewService } from "@/services/reviews/review.service";
import { ReviewDTO } from "@/types/review";

/**
 * useReviewComments : Hook de gestion des commentaires sur les critiques d'œuvres.
 */
export const useReviewComments = () => {
  const { token, user } = useAuthContext();

  /**
   * addComment : Crée un commentaire sur une critique existante.
   */
  const addComment = useCallback(async (
    parentReviewId: string,
    contentId: string,
    text: string
  ): Promise<ReviewDTO | null> => {
    if (!token || !user?.id || !text.trim()) return null;
    try {
      return await ReviewService.create(token, {
        user_id: user.id,
        content_id: contentId,
        parent_review_id: parentReviewId,
        comment: text.trim(),
      });
    } catch (err: any) {
      if (__DEV__) console.warn("[useReviewComments] addComment", err?.message);
      return null;
    }
  }, [token, user?.id]);

  /**
   * updateComment : Modifie son propre commentaire.
   */
  const updateComment = useCallback(async (
    commentId: string,
    text: string
  ): Promise<ReviewDTO | null> => {
    if (!token || !text.trim()) return null;
    try {
      return await ReviewService.update(token, commentId, { comment: text.trim() });
    } catch (err: any) {
      if (__DEV__) console.warn("[useReviewComments] updateComment", err?.message);
      return null;
    }
  }, [token]);

  /**
   * removeComment : Supprime son propre commentaire.
   */
  const removeComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await ReviewService.remove(token, commentId);
      return true;
    } catch (err: any) {
      if (__DEV__) console.warn("[useReviewComments] removeComment", err?.message);
      return false;
    }
  }, [token]);

  return {
    addComment,
    updateComment,
    removeComment,
  };
};