import { User } from "@/types/auth";
import { ReviewComment, SocialActivity } from "@/types/community";

/**
 * SocialService : Moteur du flux d'activité communautaire.
 * Ce service centralise la récupération des interactions sociales du réseau (Follows).
 * Il respecte le principe de tri chronologique inverse pour le fil d'actualité.
 */
export const SocialService = {
  /**
   * getFeed : Récupère les dernières activités des abonnements de l'utilisateur.
   * Agrège différents types d'actions (Critiques détaillées, Notes simples).
   * * @returns Promise<SocialActivity[]> - Liste des activités formatées pour le feed.
   */
  getFeed: async (): Promise<SocialActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "act_1",
            userId: "u1",
            user: "Marc",
            type: "REVIEW",
            targetMedia: "Jazz Night",
            text: "La sélection Bebop était parfaite. Un vrai régal pour mes oreilles !",
            value: 4, 
            timestamp: "Il y a 10m",
            likes: 24,
            commentsCount: 8
          },
          {
            id: "act_2",
            userId: "u2",
            user: "Sophie",
            type: "RATING",
            targetMedia: "FIP Metal",
            value: 5,
            timestamp: "Il y a 1h",
            likes: 12,
            commentsCount: 2
          }
        ]);
      }, 800);
    });
  },

  /**
   * toggleLike : Permet d'aimer ou de retirer son j'aime sur une activité.
   * * @param activityId - L'ID de l'activité à liker.
   * @returns Promise<boolean> - Confirmation du succès de l'action.
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
          bio: "Amoureuse de Jazz avant-gardiste et curatrice de sons nocturnes. Monoko addict. 🎧",
          followersCount: 142,
          followingCount: 89,
          isFollowing: false
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