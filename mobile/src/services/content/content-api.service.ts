import { apiFetch } from "@/utils/apiFetch";
import { ContentDTO, CreateContentPayload } from "@/types/content-api";

/**
 * ContentApiService : service d'accès au cache local de contenus.
 * Le cache local est une couche d'abstraction qui stocke les contenus importés depuis les différentes API tierces.
 * Cela permet de gérer de manière unifiée les contenus, même si les APIs tierces changent ou suppriment des éléments,
 * et de simplifier les interactions avec les contenus dans le reste de l'application (collections, critiques, etc.) en utilisant des UUID locaux stables.
 * Les méthodes du ContentApiService permettent de créer, récupérer et rechercher des contenus dans ce cache local,
 * ainsi que de résoudre les api_id externes en UUID locaux pour une intégration transparente avec les autres fonctionnalités de l'application qui manipulent des contenus
 */
export const ContentApiService = {
  /**
   * getAll : GET /content
   * Récupère tout le cache de contenus. Utilisé pour la recherche par api_id
   * en attendant une route dédiée côté backend (voir findByApiId).
   */
  getAll: (token: string): Promise<ContentDTO[]> =>
    apiFetch<ContentDTO[]>('/content', { token }),

  /**
   * getById : GET /content/{id}
   * Récupère un contenu par son UUID local.
   */
  getById: (token: string, id: string): Promise<ContentDTO> =>
    apiFetch<ContentDTO>(`/content/${id}`, { token }),

  /**
   * create : POST /content
   * Importe une œuvre de l'API tierce dans le cache local.
   */
  create: (token: string, payload: CreateContentPayload): Promise<ContentDTO> =>
    apiFetch<ContentDTO>('/content', { token, method: 'POST', body: payload }),

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