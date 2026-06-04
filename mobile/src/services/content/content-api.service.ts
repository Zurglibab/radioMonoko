import { apiFetch } from "@/utils/apiFetch";
import { ContentDTO, CreateContentPayload } from "@/types/content-api";

let _contentCache: ContentDTO[] | null = null;
let _contentCacheTs = 0;
let _pendingGetAll: Promise<ContentDTO[]> | null = null;
const CONTENT_CACHE_TTL = 60_000;

/**
 * ContentApiService : service d'accès au cache local de contenus.
 */
export const ContentApiService = {
  /**
   * getAll : GET /content
   * Récupère tout le cache de contenus avec déduplication des requêtes concurrentes
   * et mise en cache locale toutes les 60 secondes pour éviter les conflits.
   */
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

  /**
   * getById : GET /content/{id}
   * Récupère un contenu par son UUID local.
   */
  getById: (token: string, id: string): Promise<ContentDTO> =>
    apiFetch<ContentDTO>(`/content/${id}`, { token }),

  /**
   * create : POST /content
   * Importe une œuvre de l'API tierce dans le cache local.
   * Invalide le cache getAll pour que findByApiId retourne le nouveau contenu immédiatement.
   */
  create: async (token: string, payload: CreateContentPayload): Promise<ContentDTO> => {
    const created = await apiFetch<ContentDTO>('/content', { token, method: 'POST', body: payload });
    // Invalider le cache local pour inclure le nouveau contenu
    if (_contentCache) _contentCache = [..._contentCache, created];
    return created;
  },

  /**
    * findByApiId : recherche dans le cache local une œuvre par son api_id (ID de l'API tierce).
    * Permet de vérifier si une œuvre de l'API tierce a déjà été importée avant d'en créer une nouvelle.
    *
    * @returns le ContentDTO s'il existe déjà dans le cache, sinon null.
   */
  findByApiId: async (token: string, apiId: string): Promise<ContentDTO | null> => {
    const all = await ContentApiService.getAll(token);
    return all.find(c => c.api_id === apiId) ?? null;
  },

  /**
   * resolveContentId : méthode utilitaire qui, pour un api_id donné, retourne l'UUID local du content correspondant dans le cache.
   * Si aucun content avec cet api_id n'existe, il est créé dans le cache à partir des métadonnées fournies, et son UUID est retourné.
   *
   * @param apiId    ID externe de l'œuvre (ex: "FIP")
   * @param metadata Métadonnées à stocker si l'œuvre doit être créée
   */
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