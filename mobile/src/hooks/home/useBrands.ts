import { useState, useEffect, useCallback } from "react";
import { Station } from "@/types/content";
import { BrandService } from "@/services/brand/brand.service";
import { mapBrandToStation } from "@/utils/mappers/brand.mapper";

const HOME_CAROUSEL_LIMIT = 5;

export const useBrands = () => {
  const [brands, setBrands] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * loadBrands : Charge les stations depuis l'API et les mappe vers le modèle UI.
   * Le service BrandService renvoie déjà un tableau de Brand[] déballé.
   */
  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawBrands = await BrandService.fetchAllBrands();

      if (!Array.isArray(rawBrands)) {
        throw new Error("Le serveur n'a pas renvoyé le tableau de données attendu.");
      }

      const mappedStations = rawBrands
        .map(mapBrandToStation)
        .slice(0, HOME_CAROUSEL_LIMIT);

      setBrands(mappedStations);
    } catch (err: any) {
      if (__DEV__) console.warn("[useBrands] Erreur de synchronisation API :", err?.message);
      setError(err?.message || "Une erreur est survenue lors du chargement des stations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch: loadBrands,
  };
};