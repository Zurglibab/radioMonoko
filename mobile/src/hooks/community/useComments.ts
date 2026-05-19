import { useState, useEffect } from "react";
import { SocialService } from "@/services/community/social.service";
import { ReviewComment } from "@/types/community";
import { useAuthContext } from "@/context/AuthContext";

/**
 * useComments : Hook gérant l'espace des commentaires sous une critique ou activité.
 * Supporte les commentaires de premier niveau, le focus sur un commentaire spécifique,
 * le système de réponse imbriqué (Replies), les likes et la suppression.
 * 
 * @param activityId - L'identifiant de la critique ou de l'activité parente.
 * @param targetCommentId - (Optionnel) ID d'un commentaire ciblé à mettre en avant.
 */
export const useComments = (activityId: string, targetCommentId?: string) => {
  const { user } = useAuthContext();
  const currentUserId = user?.id ?? "current_user";

  // ÉTATS LOCAUX
  const [comments, setComments] = useState<ReviewComment[]>([]); // Liste des commentaires affichés
  const [focusedComment, setFocusedComment] = useState<ReviewComment | null>(null); // Commentaire mis en avant (si targetCommentId)
  const [replyingTo, setReplyingTo] = useState<ReviewComment | null>(null); // Stocke le commentaire auquel l'utilisateur répond
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Récupère tous les commentaires et filtre selon le contexte :
   * - Si targetCommentId : On isole le commentaire focus et on affiche ses réponses (parentId).
   * - Sinon : On affiche uniquement les commentaires racine (!parentId).
   */
  useEffect(() => {
    const loadComments = async () => {
      // Appel au service communautaire pour récupérer les commentaires liés à l'activité
      const data = await SocialService.getCommentsForActivity(activityId);

      if (targetCommentId) {
        const target = data.find(c => c.id === targetCommentId);
        if (target) setFocusedComment(target);
        setComments(data.filter(c => c.parentId === targetCommentId));
      } else {
        setComments(data.filter(c => !c.parentId));
      }
      setIsLoading(false);
    };

    if (activityId) loadComments();
  }, [activityId, targetCommentId]);

  /**
   * sendComment : Simule l'envoi d'un commentaire ou d'une réponse.
   * Injecte dynamiquement les métadonnées de l'utilisateur connecté et les liaisons parentes.
   */
  const sendComment = async (text: string) => {
    if (!text.trim()) return;

    // Construction de l'objet selon l'interface ReviewComment
    const newComment: ReviewComment = {
      id: Date.now().toString(), // ID temporaire unique
      userId: currentUserId,
      username: user?.username ?? "Moi",
      avatar: user?.avatar,
      text,
      timestamp: "Maintenant",
      likes: 0,
      hasLiked: false,
      parentId: targetCommentId, // Lie la réponse au fil actuel
      replyTo: replyingTo?.username, // Métadonnée sociale
      replyToUserId: replyingTo?.userId,
    };

    setComments(prev => [...prev, newComment]);
    setReplyingTo(null); // Reset de l'état de réponse après envoi
  };

  /**
   * toggleLikeComment : Gère l'incrémentation/décrémentation des likes.
   * Traite séparément le commentaire principal mis au focus et la liste des réponses secondaires.
   */
  const toggleLikeComment = (commentId: string) => {
    // Cas 1 : C'est le commentaire mis en avant qui est liké
    if (focusedComment?.id === commentId) {
      setFocusedComment(prev =>
        prev
          ? { ...prev, likes: prev.hasLiked ? prev.likes - 1 : prev.likes + 1, hasLiked: !prev.hasLiked }
          : null
      );
      return;
    }

    // Cas 2 : C'est un commentaire de la liste standard
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, likes: c.hasLiked ? c.likes - 1 : c.likes + 1, hasLiked: !c.hasLiked }
          : c
      )
    );
  };

  /**
   * deleteMyComment : Permet à l'utilisateur d'effacer sa propre critique/réponse.
   */
  const deleteMyComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  return {
    comments,
    focusedComment,
    replyingTo,
    setReplyingTo,
    isLoading,
    sendComment,
    toggleLikeComment,
    deleteMyComment,
    currentUserId,
  };
};