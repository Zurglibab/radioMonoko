import { apiFetch } from "@/utils/apiFetch";
import { ContentDTO, CreateContentPayload } from "@/types/content-api";

let _contentCache: ContentDTO[] | null = null;
let _contentCacheTs = 0;
let _pendingGetAll: Promise<ContentDTO[]> | null = null;
const CONTENT_CACHE_TTL = 60_000;

export const ContentApiService = {
  getAll: async (token: string): Promise<ContentDTO[]> => {
    const now = Date.now();
    if (_contentCache && now - _contentCacheTs < CONTENT_CACHE_TTL) {
      return _contentCache;
    }
    if (_pendingGetAll) return _pendingGetAll;

    _pendingGetAll = apiFetch<ContentDTO[]>('/content', { token })
      .then(data => {
        _contentCache = data;
        _contentCacheTs = Date.now();
        _pendingGetAll = null;
        return data;
      })
      .catch(err => {
        _pendingGetAll = null;
        throw err;
      });

    return _pendingGetAll;
  },

  getById: (token: string, id: string): Promise<ContentDTO> =>
    apiFetch<ContentDTO>(`/content/${id}`, { token }),

  create: async (token: string, payload: CreateContentPayload): Promise<ContentDTO> => {
    const created = await apiFetch<ContentDTO>('/content', { token, method: 'POST', body: payload });
    if (_contentCache) _contentCache = [..._contentCache, created];
    return created;
  },

  findByApiId: async (token: string, apiId: string): Promise<ContentDTO | null> => {
    const all = await ContentApiService.getAll(token);
    return all.find(c => c.api_id === apiId) ?? null;
  },

  resolveContentId: async (
    token: string,
    apiId: string,
    metadata: Omit<CreateContentPayload, 'api_id'>
  ): Promise<string> => {
    const existing = await ContentApiService.findByApiId(token, apiId);
    if (existing) return existing.id;

    const created = await ContentApiService.create(token, { api_id: apiId, ...metadata });
    return created.id;
  },
};
