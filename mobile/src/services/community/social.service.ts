import { User } from "@/types/auth";
import { ReviewComment, SocialActivity } from "@/types/community";
import { ReviewService } from "@/services/reviews/review.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { UserService } from "@/services/users/user.service";
import { LikeReviewService } from "@/services/reviews/likeReview.service";

const FEED_LIMIT = 15;

/**
 * SocialService : Moteur du flux d'activité communautaire.
 */
export const SocialService = {
  /**
   * getFeed : GET /social/feed
   *
   * Récupère le flux d'activité communautaire pour l'utilisateur connecté.
   */
  getFeed: async (token: string): Promise<SocialActivity[]> => {
    const allReviews = await ReviewService.getAll(token);

    const topLevel = allReviews
      .filter(r => r.parent_review_id === null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, FEED_LIMIT);

    if (topLevel.length === 0) return [];

    const commentCountMap: Record<string, number> = {};
    for (const r of allReviews) {
      if (r.parent_review_id) {
        commentCountMap[r.parent_review_id] = (commentCountMap[r.parent_review_id] ?? 0) + 1;
      }
    }

    const uniqueContentIds = [...new Set(topLevel.map(r => r.content_id))];
    const contentMap: Record<string, string> = {};
    await Promise.all(
      uniqueContentIds.map(async id => {
        try {
          const content = await ContentApiService.getById(token, id);
          contentMap[id] = content.title;
        } catch {
          contentMap[id] = "Contenu inconnu";
        }
      })
    );

    const uniqueUserIds = [...new Set(topLevel.map(r => r.user_id))];
    const userMap: Record<string, { username: string; avatar?: string }> = {};
    const likeMap: Record<string, number> = {};

    await Promise.all([
      ...uniqueUserIds.map(async id => {
        try {
          const profile = await UserService.getById(token, id);
          userMap[id] = { username: profile.display_name ?? profile.username, avatar: profile.avatar };
        } catch {
          userMap[id] = { username: "Utilisateur" };
        }
      }),
      ...topLevel.map(async review => {
        try {
          const counts = await LikeReviewService.getCount(token, review.id);
          likeMap[review.id] = counts.likes;
        } catch {
          likeMap[review.id] = 0;
        }
      }),
    ]);

    return topLevel.map(review => ({
      id: review.id,
      userId: review.user_id,
      user: userMap[review.user_id]?.username ?? "Utilisateur",
      avatar: userMap[review.user_id]?.avatar,
      type: 'REVIEW' as const,
      targetMedia: contentMap[review.content_id] ?? "Contenu inconnu",
      text: review.comment || undefined,
      timestamp: new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      likes: likeMap[review.id] ?? 0,
      commentsCount: commentCountMap[review.id] ?? 0,
    }));
  },

  /**
   * toggleLike : Permet de liker ou unliker une activité (ex: une critique).
   * Implémentation fictive pour démonstration, à remplacer par un appel API réel.
   * @returns le nouvel état "liké" (true) ou "non liké" (false).
   */
  toggleLike: async (activityId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log(`[Social] Toggle like sur l'activité : ${activityId}`);
      setTimeout(() => resolve(true), 300);
    });
  },

  /**
   * getCommentsForActivity : Récupère la liste des commentaires d'un post.
   */
  getCommentsForActivity: async (activityId: string): Promise<ReviewComment[]> => {
    return new Promise((resolve) => {
      console.log(`[Social] Chargement des commentaires pour : ${activityId}`);
      setTimeout(() => {
        resolve([
          { id: "c1", userId: "u2", username: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=333&color=fff", text: "Totalement d'accord avec toi !", timestamp: "2h", likes: 4, hasLiked: false, repliesCount: 2 },
          { id: "c2", userId: "u3", username: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob&background=555&color=fff", text: "Je préfère la version de 1998 perso.", timestamp: "1h", likes: 0, hasLiked: false, repliesCount: 0 },
          { id: "c3", userId: "u4", username: "Leila", avatar: "https://ui-avatars.com/api/?name=Leila&background=888&color=fff", text: "Alice tu as complètement raison !", timestamp: "1h30", likes: 1, hasLiked: false, parentId: "c1", replyTo: "Alice", replyToUserId: "u2" },
          { id: "c4", userId: "u5", username: "Tom", avatar: "https://ui-avatars.com/api/?name=Tom&background=222&color=fff", text: "Moi je suis plutôt mitigé sur cette sélection.", timestamp: "30m", likes: 3, hasLiked: false, parentId: "c1", replyTo: "Alice", replyToUserId: "u2" },
        ]);
      }, 400);
    });
  },

  /**
   * Récupère le profil public d'un autre utilisateur pour l'écran "Twitter-like"
   */
  getUserProfile: async (userId: string): Promise<User & { bio: string; followersCount: number; followingCount: number; isFollowing: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: userId,
          username: userId === "u1" ? "Marc" : userId === "u2" ? "Alice" : "Bob",
          email: `${userId}@radiomonoko.community`,
          avatar: `https://ui-avatars.com/api/?name=${userId === "u1" ? "Marc" : userId === "u2" ? "Alice" : "Bob"}&background=random&color=fff`,
          privacy: 'public' as const,
          bio: "Amoureuse de Jazz avant-gardiste et curatrice de sons nocturnes. Monoko addict. 🎧",
          followersCount: 142,
          followingCount: 89,
          isFollowing: false,
        });
      }, 500);
    });
  },

  /**
   * Enregistre un nouveau commentaire sur les serveurs
   */
  addComment: async (
    _activityId: string,
    text: string,
    parentId?: string,
    replyTo?: string,
    replyToUserId?: string
  ): Promise<ReviewComment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          userId: "current_user",
          username: "Moi",
          text,
          timestamp: "Maintenant",
          likes: 0,
          hasLiked: false,
          parentId,
          replyTo,
          replyToUserId,
        });
      }, 300);
    });
  }
};