import { useState, useEffect, useCallback } from "react";
import { Station } from "@/types/content";
import { BrandService } from "@/services/brand/brand.service";
import { flattenBrandsToStations } from "@/utils/mappers/brand.mapper";

const HOME_CAROUSEL_LIMIT = 8;

export const useBrands = (skipInitialFetch = false) => {
  const [brands, setBrands] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawBrands = await BrandService.fetchAllBrands();

      if (!Array.isArray(rawBrands)) {
        throw new Error("Le serveur n'a pas renvoyé le tableau de données attendu.");
      }

      setBrands(flattenBrandsToStations(rawBrands).slice(0, HOME_CAROUSEL_LIMIT));
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors du chargement des stations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch) {
      setIsLoading(false);
      return;
    }
    loadBrands();
  }, [skipInitialFetch, loadBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch: loadBrands,
  };
};