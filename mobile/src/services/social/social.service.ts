import { apiFetch } from "@/utils/apiFetch";
import { 
  Friend, 
  PendingFriendRequest, 
  RelationActionResponse 
} from "@/types/social";

/**
 * SocialService : Service centralisé pour gérer les interactions sociales entre utilisateurs.
 * Il fournit des méthodes pour récupérer les amis, les demandes d'amis en attente, et pour suivre, unfollow, accepter, refuser ou bloquer des utilisateurs.
 * Chaque méthode correspond à un endpoint de l'API backend et gère les différentes actions sociales de manière cohérente.
 */
export const SocialService = {
  /**
   * fetchMyFriends : GET /userRelation/friends
   * Récupère la liste des amis mutuellement acceptés de l'utilisateur connecté.
   */
  fetchMyFriends: (token: string): Promise<Friend[]> =>
    apiFetch<Friend[]>('/userRelation/friends', { token }),

  /**
   * fetchMyFollowing : GET /userRelation/following
   * Récupère la liste des utilisateurs que je suis (acceptés + en attente).
   */
  fetchMyFollowing: (token: string): Promise<Friend[]> =>
    apiFetch<Friend[]>('/userRelation/following', { token }),

  /**
   * fetchUserFriends : GET /userRelation/friends/{id}
   * Récupère la liste des amis d'un autre utilisateur (selon sa visibilité).
   * Peut renvoyer 403 si le profil est privé ou bloqué.
   */
  fetchUserFriends: (token: string, userId: string): Promise<Friend[]> =>
    apiFetch<Friend[]>(`/userRelation/friends/${userId}`, { token }),

  /**
   * fetchPendingRequests : GET /userRelation/request
   * Récupère les demandes d'amis en attente reçues par l'utilisateur connecté.
   */
  fetchPendingRequests: (token: string): Promise<PendingFriendRequest[]> =>
    apiFetch<PendingFriendRequest[]>('/userRelation/request', { token }),

  /**
   * followUser : POST /userRelation/follow/{id}
   * Envoie une demande d'ami ou s'abonne à un utilisateur cible.
   * @param userId UUID de l'utilisateur cible
   */
  followUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/follow/${userId}`, { 
      token, 
      method: 'POST' 
    }),

  /**
   * unfollowUser : DELETE /userRelation/unfollow/{id}
   * Retire un ami ou se désabonne d'un utilisateur.
   * @param userId UUID de l'utilisateur cible
   */
  unfollowUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/unfollow/${userId}`, { 
      token, 
      method: 'DELETE' 
    }),

  /**
   * acceptRequest : PATCH /userRelation/accept/{id}
   * Accepte une demande d'ami reçue.
   * @param fromUserId UUID de l'utilisateur ayant envoyé la demande
   */
  acceptRequest: (token: string, fromUserId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/accept/${fromUserId}`, { 
      token, 
      method: 'PATCH' 
    }),

  /**
   * refuseRequest : PATCH /userRelation/refuse/{id}
   * Refuse une demande d'ami reçue.
   * @param fromUserId UUID de l'utilisateur ayant envoyé la demande
   */
  refuseRequest: (token: string, fromUserId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/refuse/${fromUserId}`, { 
      token, 
      method: 'PATCH' 
    }),

  /**
   * blockUser : POST /userRelation/block/{id}
   * Bloque définitivement un utilisateur, rompt toute relation existante.
   * @param userId UUID de l'utilisateur à bloquer
   */
  blockUser: (token: string, userId: string): Promise<RelationActionResponse> =>
    apiFetch<RelationActionResponse>(`/userRelation/block/${userId}`, { 
      token, 
      method: 'POST' 
    }),
};