import { ContentStatus } from "@/constants/library-status";

/**
 * ContentStatusRecord : Représente le statut d'un contenu dans la bibliothèque d'un utilisateur.
 * Correspond à la table ContentStatus du backend.
 */
export interface ContentStatusRecord {
  content_id: string;
  user_id: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

/**
 * UpsertContentStatusPayload : Body du PUT /content/status.
 */
export interface UpsertContentStatusPayload {
  content_id: string;
  user_id: string;
  status: ContentStatus;
}