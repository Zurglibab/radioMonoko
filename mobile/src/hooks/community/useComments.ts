import { useState, useEffect, useCallback } from "react";
import { ReviewService } from "@/services/reviews/review.service";
import { LikeReviewService } from "@/services/reviews/likeReview.service";
import { UserService } from "@/services/users/user.service";
import { NotificationService } from "@/services/notifications/notification.service";
import { ReviewComment } from "@/types/community";
import { useAuthContext } from "@/context/AuthContext";

// Normalise les réponses API : tableau direct ou { data: [...] }
function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as any).data))
    return (raw as any).data as T[];
  return [];
}

/**
 * enrichWithUsernames : Fonction d'enrichissement des commentaires avec les noms d'utilisateur.
 * Cette fonction prend une liste de commentaires bruts (contenant seulement les user_id) et enrichit chaque commentaire
 * avec le nom d'utilisateur correspondant. Elle effectue des appels parallèles pour récupérer les profils utilisateur
 * et construire une map d'id vers nom d'utilisateur, afin d'optimiser les performances.
 * @param token 
 * @param raw 
 * @returns 
 */
const enrichWithUsernames = async (token: string, raw: unknown): Promise<ReviewComment[]> => {
  const dtos = toArray<any>(raw);
  if (dtos.length === 0) return [];
  const uniqueIds = [...new Set(dtos.map((d: any) => d.user_id as string))];
  const userMap: Record<string, string> = {};
  await Promise.all(
    uniqueIds.map(async id => {
      try {
        const profile = await UserService.getById(token, id);
        userMap[id] = profile.display_name ?? profile.username;
      } catch {
        userMap[id] = "Utilisateur";
      }
    })
  );
  return dtos.map(dto => ({
    id: dto.id,
    userId: dto.user_id,
    username: userMap[dto.user_id] ?? "Utilisateur",
    text: dto.comment,
    timestamp: new Date(dto.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    likes: 0,
    hasLiked: false,
    parentId: dto.parent_review_id ?? undefined,
  }));
};

/**
 * enrichWithLikes : Fonction d'enrichissement des commentaires avec les données de like.
 * Cette fonction prend une liste de commentaires et ajoute à chacun le nombre de likes, 
 * ainsi que l'information si l'utilisateur actuel a aimé le commentaire ou pas. 
 * Elle utilise le LikeReviewService pour récupérer les données de like depuis l'API.
 * @param token 
 * @param comments 
 * @param currentUserId 
 * @returns 
 */
const enrichWithLikes = async (
  token: string,
  comments: ReviewComment[],
  currentUserId: string
): Promise<ReviewComment[]> => {
  if (comments.length === 0) return comments;
  return Promise.all(
    comments.map(async c => {
      try {
        const [likesRaw, repliesRaw] = await Promise.all([
          LikeReviewService.getByReview(token, c.id),
          ReviewService.getByParent(token, c.id),
        ]);
        const likes = toArray<any>(likesRaw);
        const replies = toArray<any>(repliesRaw);
        return {
          ...c,
          likes: likes.filter((l: any) => l.is_like).length,
          hasLiked: likes.some((l: any) => l.user_id === currentUserId && l.is_like),
          repliesCount: replies.length,
        };
      } catch {
        return c;
      }
    })
  );
};

/**
 * useComments : Hook de gestion des commentaires sur une critique ou un commentaire.
 * Ce hook centralise la logique de chargement, d'enrichissement, et de gestion des commentaires associés à une critique ou à un commentaire spécifique.
 * Il gère l'état des commentaires, le commentaire ciblé (pour les liens directs), les réponses, et les interactions de like. Il utilise les services ReviewService et LikeReviewService pour interagir avec l'API et enrichir les données pour l'affichage.
 * @param activityId 
 * @param targetCommentId 
 * @param externalContentId 
 * @param parentAuthorId 
 * @returns 
 */
export const useComments = (
  activityId: string,
  targetCommentId?: string,
  externalContentId?: string | null,
  parentAuthorId?: string | null
) => {
  const { user, token } = useAuthContext();
  const currentUserId = user?.id ?? "";
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [focusedComment, setFocusedComment] = useState<ReviewComment | null>(null);
  const [replyingTo, setReplyingTo] = useState<ReviewComment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentId, setContentId] = useState<string | null>(externalContentId ?? null);

  useEffect(() => {
    if (externalContentId) setContentId(externalContentId);
  }, [externalContentId]);
  useEffect(() => {
    if (!externalContentId && token && activityId) {
      ReviewService.getById(token, activityId)
        .then(r => setContentId(r.content_id))
        .catch(() => {});
    }
  }, [externalContentId, token, activityId]);

  const load = useCallback(async () => {
    if (!token || !activityId) return;
    setIsLoading(true);

    try {
      let baseComments: ReviewComment[];

      if (targetCommentId) {
        const [directRaw, replyRaw] = await Promise.all([
          ReviewService.getByParent(token, activityId),
          ReviewService.getByParent(token, targetCommentId),
        ]);
        const directComments = await enrichWithUsernames(token, toArray(directRaw));
        const target = directComments.find(c => c.id === targetCommentId) ?? null;
        setFocusedComment(target);
        baseComments = await enrichWithUsernames(token, toArray(replyRaw));
      } else {
        const raw = await ReviewService.getByParent(token, activityId);
        baseComments = await enrichWithUsernames(token, toArray(raw));
      }
      setComments(baseComments);
      setIsLoading(false);
      if (baseComments.length > 0) {
        const enriched = await enrichWithLikes(token, baseComments, currentUserId);
        setComments(enriched);
        if (targetCommentId && focusedComment) {
          const updatedFocused = enriched.find(c => c.id === focusedComment.id);
          if (updatedFocused) setFocusedComment(updatedFocused);
        }
      }
    } catch (err) {
      if (__DEV__) console.warn("[useComments] load failed:", err);
      setIsLoading(false);
    }
  }, [token, activityId, targetCommentId, currentUserId]);

  useEffect(() => { if (activityId) load(); }, [load, activityId]);

  const sendComment = async (text: string) => {
    if (!text.trim() || !token || !user?.id || !contentId) return;

    const optimistic: ReviewComment = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      username: user.username ?? "Moi",
      avatar: user.avatar,
      text,
      timestamp: "Maintenant",
      likes: 0,
      hasLiked: false,
      parentId: targetCommentId ?? activityId,
      replyTo: replyingTo?.username,
      replyToUserId: replyingTo?.userId,
    };
    setComments(prev => [...prev, optimistic]);
    setReplyingTo(null);

    try {
      const created = await ReviewService.create(token, {
        user_id: user.id,
        content_id: contentId,
        parent_review_id: targetCommentId ?? activityId,
        comment: text,
      });
      setComments(prev => prev.map(c =>
        c.id === optimistic.id ? { ...optimistic, id: created.id } : c
      ));
      // Notifier l'auteur du post original (sauf si c'est soi-même)
      if (parentAuthorId && parentAuthorId !== user.id) {
        NotificationService.create(token, {
          user_id: parentAuthorId,
          type: "comment",
          message: `${user.username ?? "Quelqu'un"} a commenté votre critique`,
          is_read: false,
        }).catch(() => {});
      }
    } catch {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!token || !user?.id) return;

    const current =
      comments.find(c => c.id === commentId) ??
      (focusedComment?.id === commentId ? focusedComment : null);
    if (!current) return;

    const wasLiked = current.hasLiked ?? false;
    const update = (c: ReviewComment) =>
      c.id === commentId
        ? { ...c, hasLiked: !wasLiked, likes: wasLiked ? c.likes - 1 : c.likes + 1 }
        : c;
    const revert = (c: ReviewComment) =>
      c.id === commentId
        ? { ...c, hasLiked: wasLiked, likes: wasLiked ? c.likes + 1 : c.likes - 1 }
        : c;

    if (focusedComment?.id === commentId) {
      setFocusedComment(prev => (prev ? update(prev) : null));
    } else {
      setComments(prev => prev.map(update));
    }

    try {
      if (wasLiked) {
        await LikeReviewService.remove(token, commentId, user.id);
      } else {
        await LikeReviewService.upsert(token, commentId, user.id, true);
      }
    } catch {
      if (focusedComment?.id === commentId) {
        setFocusedComment(prev => (prev ? revert(prev) : null));
      } else {
        setComments(prev => prev.map(revert));
      }
    }
  };

  const deleteMyComment = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    if (token) {
      try { await ReviewService.remove(token, commentId); } catch { /* non-blocking */ }
    }
  };

  return {
    comments,
    focusedComment,
    replyingTo,
    setReplyingTo,
    isLoading,
    contentId,
    sendComment,
    toggleLikeComment,
    deleteMyComment,
    currentUserId,
  };
};
