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
  // GET /collections
  getAll: (token: string): Promise<CollectionDTO[]> =>
    apiFetch<CollectionDTO[]>('/collections', { token }),

  // GET /collections/collection/user/{userId}
  getUserCollections: (token: string, userId: string): Promise<CollectionDTO[]> =>
    apiFetch<CollectionDTO[]>(`/collections/collection/user/${userId}`, { token }),

  // GET /collections/{id}
  getById: (token: string, id: string): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>(`/collections/${id}`, { token }),

  // POST /collections
  create: (token: string, payload: CreateCollectionPayload): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>('/collections', { token, method: 'POST', body: payload }),

  // PUT /collections/{id}
  update: (token: string, id: string, payload: UpdateCollectionPayload): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>(`/collections/${id}`, { token, method: 'PUT', body: payload }),

  // DELETE /collections/{id}
  remove: (token: string, id: string): Promise<CollectionDTO> =>
    apiFetch<CollectionDTO>(`/collections/${id}`, { token, method: 'DELETE' }),

  // GET /collectionItems
  getAllItems: (token: string): Promise<CollectionItemDTO[]> =>
    apiFetch<CollectionItemDTO[]>('/collectionItems', { token }),

  // GET /collectionItems/collection/${collectionId}
  getItems: (token: string, collectionId: string): Promise<CollectionItemDTO[]> =>
    apiFetch<CollectionItemDTO[]>(`/collectionItems/collection/${collectionId}`, { token }),

  // GET /collectionItems/collection/{collectionId}/content/{contentId}
  getItemByCompositeKey: (token: string, collectionId: string, contentId: string): Promise<CollectionItemDTO> =>
    apiFetch<CollectionItemDTO>(`/collectionItems/collection/${collectionId}/content/${contentId}`, { token }),

  // POST /collectionItems
  addItem: (token: string, payload: AddCollectionItemPayload): Promise<CollectionItemDTO> =>
    apiFetch<CollectionItemDTO>('/collectionItems', { token, method: 'POST', body: payload }),

  // PUT /collectionItems/collection/{collectionId}/content/{contentId}
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

  // DELETE /collectionItems/collection/{collectionId}/content/{contentId}
  removeItem: (token: string, collectionId: string, contentId: string): Promise<CollectionItemDTO> =>
    apiFetch<CollectionItemDTO>(
      `/collectionItems/collection/${collectionId}/content/${contentId}`,
      { token, method: 'DELETE' }
    ),
};