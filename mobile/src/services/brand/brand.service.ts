import { apiFetch } from "@/utils/apiFetch";
import { Brand, ApiEnvelope } from "@/types/brand";

export const BrandService = {
  fetchAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await apiFetch<ApiEnvelope<Brand[]>>('/api/brands');
      return response.data;
    } catch {
      throw new Error("Impossible de récupérer les marques depuis le serveur.");
    }
  },

  fetchBrandById: async (id: string): Promise<Brand> => {
    try {
      const response = await apiFetch<ApiEnvelope<Brand>>(`/api/brands/${id}`);
      return response.data;
    } catch {
      throw new Error(`Impossible de récupérer la marque avec l'ID : ${id}`);
    }
  },

  searchByTitle: async (token: string, title: string): Promise<Brand[]> => {
    const resp = await apiFetch<{ success: boolean; data: Brand[] }>(
      `/api/brands/search/${encodeURIComponent(title)}`,
      { token }
    );
    return resp.data || [];
  },
};
