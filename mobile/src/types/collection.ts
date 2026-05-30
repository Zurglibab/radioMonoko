import { ContentDTO } from "./content-api";

/**
 * CollectionItem : un élément de collection.
 * Construit côté client par le hook via le N+1 fetch sur /content/{id}.
 */
export interface CollectionItem {
  collectionId: string;
  contentId: string;
  position: number;
  note: string;
  createdAt: string;
  content: ContentDTO | null; // null si le content a été supprimé entre-temps
}

/**
 * CollectionDTO : Structure brute d'une collection (liste personnalisée)
 * renvoyée par l'API /collections.
 */
export interface CollectionDTO {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

/**
 * CollectionItemDTO : Élément (œuvre) appartenant à une collection.
 * Renvoyé par l'API /collectionItems.
 */
export interface CollectionItemDTO {
  collection_id: string;
  content_id: string;
  position: number;
  note: string;
  created_at: string;
}

/**
 * Payloads de création/mise à jour.
 */
export interface CreateCollectionPayload {
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  is_public?: boolean;
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