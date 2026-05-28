/**
 * Friend : Représente un utilisateur lié par une relation d'amitié validée.
 * Structure minimaliste renvoyée par GET /userRelation/friends et /friends/{id}.
 * 
 * Le backend ne renvoie que les infos publiques essentielles (pas d'email, pas de bio)
 * pour préserver la vie privée des utilisateurs listés.
 */
export interface Friend {
  id: string;
  username: string;
  isPublic: boolean;
}

/**
 * PendingFriendRequest : Demande d'ami en attente reçue par l'utilisateur connecté.
 * Renvoyée par GET /userRelation/request.
 * 
 */
export interface PendingFriendRequest {
  id: string;
  username: string;
}

/**
 * Les routes d'action sociale (/follow, /accept, /refuse, /unfollow, /block)
 * renvoient un body vide. Le succès est porté par le code HTTP :
 * - POST /follow → 201 Created
 * - PATCH /accept, /refuse → 200 OK
 * - DELETE /unfollow → 200 OK
 * - POST /block → 200 OK
 */
export type RelationActionResponse = void;