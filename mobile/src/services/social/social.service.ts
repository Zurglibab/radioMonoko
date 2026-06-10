import { apiFetch } from "@/utils/apiFetch";
import { ReviewService } from "@/services/reviews/review.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { UserService } from "@/services/users/user.service";
import { LikeReviewService, LikeReview } from "@/services/reviews/likeReview.service";
import { ReviewComment, SocialActivity } from "@/types/community";
import {
  Friend,
  PendingFriendRequest,
  RelationActionResponse,
} from "@/types/social";

// Plafond de 20 activités pour éviter les temps de chargement trop longs sur le feed d'accueil
const FEED_LIMIT = 20;

// Permet de gérer les différentes formes de données que le backend peut renvoyer (liste directe ou enveloppée dans un objet { data: [...] })
function toArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as any).data))
    return (raw as any).data as T[];
  return [];
}

/**
 * SocialService : Gestion des interactions sociales (amis, feed, commentaires).
 * Centralise toutes les fonctionnalités liées à la dimension sociale de l'application,
 * comme la gestion des amis, le suivi, le feed d'activité, et les commentaires sur les critiques.
 * Il interagit avec plusieurs endpoints de l'API pour fournir une expérience sociale riche et cohérente.
 */
export const SocialService = {
  fetchMyFriends: (token: string): Promise<Friend[]> =>
    apiFetch<Friend[]>("/userRelation/friends", { token }),

  fetchMyFollowing: (token: string): Promise<Friend[]> =>
    apiFetch<Friend[]>("/userRelation/following", { token }),

  fetchUserFriends: (token: string, userId: string): Promise<Friend[]> =>
    apiFetch<Friend[]>(`/userRelation/friends/${userId}`, { token }),

  fetchPendingRequests: (token: string): Promise<PendingFriendRequest[]> =>
    apiFetch<PendingFriendRequest[]>("/userRelation/request", { token }),

  followUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/follow/${userId}`, {
      token,
      method: "POST",
    }),

  unfollowUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/unfollow/${userId}`, {
      token,
      method: "DELETE",
    }),

  acceptRequest: (token: string, fromUserId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/accept/${fromUserId}`, {
      token,
      method: "PATCH",
    }),

  refuseRequest: (token: string, fromUserId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/refuse/${fromUserId}`, {
      token,
      method: "PATCH",
    }),

  blockUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/block/${userId}`, {
      token,
      method: "POST",
    }),

  getFeed: async (token: string, currentUserId?: string): Promise<SocialActivity[]> => {
    const allReviewsRaw = await ReviewService.getAll(token);
    const allReviews = toArray<any>(allReviewsRaw);
    const topLevel = allReviews
      .filter((r: any) => !r.parent_review_id)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, FEED_LIMIT);

    if (__DEV__) console.log("[getFeed] allReviews:", allReviews.length, "| topLevel:", topLevel.length);

    if (topLevel.length === 0) return [];

    const commentCountMap: Record<string, number> = {};
    for (const r of allReviews) {
      if (r.parent_review_id) {
        commentCountMap[r.parent_review_id] = (commentCountMap[r.parent_review_id] ?? 0) + 1;
      }
    }
    const hasCommentDataFromAll = Object.keys(commentCountMap).length > 0;
    const uniqueContentIds = [...new Set(topLevel.map((r: any) => r.content_id as string))];
    const contentMap: Record<string, string> = {};
    const uniqueUserIds = [...new Set(topLevel.map((r: any) => r.user_id as string))];
    const userMap: Record<string, { username: string; avatar?: string }> = {};
    const likeMap: Record<string, number> = {};
    const hasLikedMap: Record<string, boolean> = {};

    await Promise.all([
      ...uniqueContentIds.map(async (id: string) => {
        try {
          const content = await ContentApiService.getById(token, id);
          contentMap[id] = content.title;
        } catch {
          contentMap[id] = "Contenu inconnu";
        }
      }),
      ...uniqueUserIds.map(async (id: string) => {
        try {
          const profile = await UserService.getById(token, id);
          userMap[id] = {
            username: profile.display_name ?? profile.username,
            avatar: profile.avatar,
          };
        } catch {
          userMap[id] = { username: "Utilisateur" };
        }
      }),
    ]);

    const LIKE_BATCH = 5;
    for (let i = 0; i < topLevel.length; i += LIKE_BATCH) {
      await Promise.all(
        topLevel.slice(i, i + LIKE_BATCH).map(async (review: any) => {
          try {
            const raw = await LikeReviewService.getByReview(token, review.id);
            const allLikes = toArray<LikeReview>(raw);
            likeMap[review.id] = allLikes.filter((l: LikeReview) => l.is_like).length;
            if (currentUserId) {
              const mine = allLikes.find((l: LikeReview) => l.user_id === currentUserId);
              hasLikedMap[review.id] = mine?.is_like ?? false;
            }
          } catch {
            likeMap[review.id] = 0;
            hasLikedMap[review.id] = false;
          }

          if (!hasCommentDataFromAll) {
            try {
              const repliesRaw = await ReviewService.getByParent(token, review.id);
              commentCountMap[review.id] = toArray<any>(repliesRaw).length;
            } catch {
              commentCountMap[review.id] = 0;
            }
          }
        })
      );
    }

    return topLevel.map((review: any) => ({
      id: review.id,
      userId: review.user_id,
      user: userMap[review.user_id]?.username ?? "Utilisateur",
      avatar: userMap[review.user_id]?.avatar,
      type: "REVIEW" as const,
      targetMedia: contentMap[review.content_id] ?? "Contenu inconnu",
      contentId: review.content_id,
      text: review.comment || undefined,
      timestamp: new Date(review.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      likes: likeMap[review.id] ?? 0,
      hasLiked: hasLikedMap[review.id] ?? false,
      commentsCount: commentCountMap[review.id] ?? 0,
    }));
  },

  getCommentsForActivity: async (
    token: string,
    activityId: string
  ): Promise<{ comments: ReviewComment[]; contentId: string | null }> => {
    const parentReview = await ReviewService.getById(token, activityId);
    const dtosRaw = await ReviewService.getByParent(token, activityId);
    const dtos = toArray<any>(dtosRaw);

    const uniqueUserIds = [...new Set(dtos.map((d: any) => d.user_id as string))];
    const userMap: Record<string, string> = {};
    await Promise.all(
      uniqueUserIds.map(async (id: string) => {
        try {
          const profile = await UserService.getById(token, id);
          userMap[id] = profile.display_name ?? profile.username;
        } catch {
          userMap[id] = "Utilisateur";
        }
      })
    );

    const comments: ReviewComment[] = dtos.map((dto: any) => ({
      id: dto.id,
      userId: dto.user_id,
      username: userMap[dto.user_id] ?? "Utilisateur",
      text: dto.comment,
      timestamp: new Date(dto.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      likes: 0,
      hasLiked: false,
      parentId: dto.parent_review_id ?? undefined,
    }));

    return { comments, contentId: parentReview.content_id };
  },
};