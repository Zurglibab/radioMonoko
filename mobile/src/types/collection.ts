import { ContentDTO } from "./content-api";

/**
 * CollectionDTO : Représente une collection de contenus créée par un utilisateur.
 * Renvoyé par GET /collections/{collectionId} et GET /user/{userId}/collections
 */
export interface CollectionDTO {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  status: string | null;
  created_at: string;
}

export interface CreateCollectionPayload {
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  status?: string | null;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
  status?: string | null;
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

/**
 * CollectionItem : version "enrichie" client-side (avec le ContentDTO résolu).
 * Construite par useEnrichedCollectionItems.
 */
export interface CollectionItem {
  collectionId: string;
  contentId: string;
  position: number;
  note: string;
  createdAt: string;
  content: ContentDTO | null;
}