import { ContentDTO } from "./content-api";
import { BackendCollectionStatus } from "@/constants/library-status";

/**
 * DTOs et types liés aux collections d'utilisateurs, utilisées pour organiser les contenus dans la bibliothèque.
 * Les collections peuvent être des catégories personnalisées créées par les utilisateurs, ou des collections système prédéfinies (ex: "À écouter", "En cours", etc.).
 * Les collections système sont identifiées par un statut spécifique (BackendCollectionStatus) et ont des métadonnées associées pour faire le lien avec les statuts front (MediaStatus).
 */
export interface CollectionDTO {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  status: BackendCollectionStatus | null;
  created_at: string;
}

export interface CreateCollectionPayload {
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  status?: BackendCollectionStatus | null;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
  status?: BackendCollectionStatus | null;
}

export interface CollectionItemDTO {
  collection_id: string;
  content_id: string;
  position: number;
  note: string;
  created_at: string;
}

export interface AddCollectionItemPayload {
  collection_id: string;
  content_id: string;
  position: number;
  note: string;
}

export interface UpdateCollectionItemPayload {
  position?: number;
  note?: string;
}

export interface CollectionItem {
  collectionId: string;
  contentId: string;
  position: number;
  note: string;
  createdAt: string;
  content: ContentDTO | null;
}