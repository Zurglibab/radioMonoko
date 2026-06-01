import { apiFetch } from "@/utils/apiFetch";
import { 
  Brand, 
  ApiEnvelope, 
  BrandStatsCount, 
  BrandRefreshResult 
} from "@/types/brand";

export const BrandService = {
  /**
   * fetchAllBrands : GET /api/brands
   * Récupère la liste complète des stations principales.
   */
  fetchAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await apiFetch<ApiEnvelope<Brand[]>>('/api/brands');
      return response.data;
    } catch {
      throw new Error("Impossible de récupérer les marques depuis le serveur.");
    }
  },

  /**
   * fetchBrandById : GET /api/brands/{id}
   */
  fetchBrandById: async (id: string): Promise<Brand> => {
    try {
      const response = await apiFetch<ApiEnvelope<Brand>>(`/api/brands/${id}`);
      return response.data;
    } catch {
      throw new Error(`Impossible de récupérer la marque avec l'ID : ${id}`);
    }
  },

  /**
   * searchByTitle : GET /api/brands/search/{title}
   */
  searchByTitle: async (title: string): Promise<Brand[]> => {
    try {
      const response = await apiFetch<ApiEnvelope<Brand[]>>(
        `/api/brands/search/${encodeURIComponent(title)}`
      );
      return response.data;
    } catch {
      throw new Error(`Aucune marque trouvée pour la recherche : ${title}`);
    }
  },

  /**
   * refreshCache : POST /api/brands/refresh
   */
  refreshCache: async (): Promise<BrandRefreshResult> => {
    try {
      const response = await apiFetch<ApiEnvelope<BrandRefreshResult>>(
        '/api/brands/refresh',
        { method: 'POST' }
      );
      return response.data;
    } catch {
      throw new Error("Impossible de rafraîchir le cache des marques.");
    }
  },

  /**
   * getCacheCount : GET /api/brands/stats/count
   */
  getCacheCount: async (): Promise<BrandStatsCount> => {
    try {
      const response = await apiFetch<ApiEnvelope<BrandStatsCount>>('/api/brands/stats/count');
      return response.data;
    } catch {
      throw new Error("Impossible de récupérer les statistiques du cache.");
    }
  },

  /**
   * clearCache : DELETE /api/brands/cache
   */
  clearCache: async (): Promise<void> => {
    try {
      await apiFetch<ApiEnvelope<void>>('/api/brands/cache', { method: 'DELETE' });
    } catch {
      throw new Error("Impossible de vider le cache des marques.");
    }
  },
};