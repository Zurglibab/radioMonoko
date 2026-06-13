import { useCallback } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ReviewService } from "@/services/reviews/review.service";
import { ReviewDTO } from "@/types/review";

export const useReviewComments = () => {
  const { token, user } = useAuthContext();

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
    } catch {
      return null;
    }
  }, [token, user?.id]);

  const updateComment = useCallback(async (
    commentId: string,
    text: string
  ): Promise<ReviewDTO | null> => {
    if (!token || !text.trim()) return null;
    try {
      return await ReviewService.update(token, commentId, { comment: text.trim() });
    } catch {
      return null;
    }
  }, [token]);

  const removeComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await ReviewService.remove(token, commentId);
      return true;
    } catch {
      return false;
    }
  }, [token]);

  return {
    addComment,
    updateComment,
    removeComment,
  };
};