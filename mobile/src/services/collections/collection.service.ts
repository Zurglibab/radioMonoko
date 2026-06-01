import { apiFetch } from "@/utils/apiFetch";
import {
  CollectionDTO,
  CollectionItemDTO,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  AddCollectionItemPayload,
  UpdateCollectionItemPayload,
} from "@/types/collection";

/**
 * CollectionService : Gestion des collections (listes personnalisées) et de leurs éléments.
 */
export const CollectionService = {
  getUserCollections: (token: string, userId: string): Promise<CollectionDTO[]> =>
    apiFetch<CollectionDTO[]>(`/collections/collection/user/${userId}`, { token }),

  getById: (token: string, id: string): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>(`/collections/${id}`, { token }),

  create: (token: string, payload: CreateCollectionPayload): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>('/collections', { token, method: 'POST', body: payload }),

  update: (token: string, id: string, payload: UpdateCollectionPayload): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>(`/collections/${id}`, { token, method: 'PUT', body: payload }),

  remove: (token: string, id: string): Promise<void> =>
    apiFetch<void>(`/collections/${id}`, { token, method: 'DELETE' }),

  getItems: (token: string, collectionId: string): Promise<CollectionItemDTO[]> =>
    apiFetch<CollectionItemDTO[]>(`/collectionItems/collection/${collectionId}`, { token }),

  addItem: (token: string, payload: AddCollectionItemPayload): Promise<CollectionItemDTO> =>
    apiFetch<CollectionItemDTO>('/collectionItems', { token, method: 'POST', body: payload }),

  updateItem: (
    token: string,
    collectionId: string,
    contentId: string,
    payload: UpdateCollectionItemPayload
  ): Promise<CollectionItemDTO> =>
    apiFetch<CollectionItemDTO>(
      `/collectionItems/collection/${collectionId}/content/${contentId}`,
      { token, method: 'PUT', body: payload }
    ),

  removeItem: (token: string, collectionId: string, contentId: string): Promise<void> =>
    apiFetch<void>(
      `/collectionItems/collection/${collectionId}/content/${contentId}`,
      { token, method: 'DELETE' }
    ),
};