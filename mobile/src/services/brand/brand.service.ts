import { Platform } from "react-native";

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const API_BASE_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

/**
 * BrandService : Service de communication avec l'API pour les données de stations.
 * Fournit des méthodes pour récupérer la liste des stations et les détails d'une station spécifique.
 * Utilise l'URL de base configurée pour faire les requêtes HTTP.
 */
export const BrandService = {
  /**
   * fetchAllBrands : GET /api/brands
   * Récupère la liste de toutes les marques depuis le serveur.
   */
  fetchAllBrands: async (): Promise<any[]> => {
    if (__DEV__) console.log(`[BrandService] Récupération sur : ${API_BASE_URL}/api/brands`);

    const response = await fetch(`${API_BASE_URL}/api/brands`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les marques depuis le serveur.");
    }

    return response.json();
  },

  /**
   * fetchBrandById : GET /api/brands/{id}
   */
  fetchBrandById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Impossible de récupérer la marque avec l'ID : ${id}`);
    }

    return response.json();
  }
};