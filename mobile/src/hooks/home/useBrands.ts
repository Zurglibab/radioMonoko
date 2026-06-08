import { useState, useEffect, useCallback } from "react";
import { Station } from "@/types/content";
import { BrandService } from "@/services/brand/brand.service";
import { mapBrandToStation, mapWebRadioToStation } from "@/utils/mappers/brand.mapper";

const HOME_CAROUSEL_LIMIT = 8;

/**
 * useBrands : Pilote la récupération des marques et stations de radio.
 * @param skipInitialFetch Si true, désactive le fetch automatique au montage pour éviter les conflits.
 */
export const useBrands = (skipInitialFetch = false) => {
  const [brands, setBrands] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * loadBrands : Charge les stations depuis l'API et les mappe vers le modèle UI.
   */
  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rawBrands = await BrandService.fetchAllBrands();

      if (!Array.isArray(rawBrands)) {
        throw new Error("Le serveur n'a pas renvoyé le tableau de données attendu.");
      }

      // Aplatir brands principales + webRadios pour le carousel
      const allStations: Station[] = [];
      for (const brand of rawBrands) {
        if (brand.liveStream) allStations.push(mapBrandToStation(brand));
        for (const wr of brand.webRadios ?? []) {
          allStations.push(mapWebRadioToStation(wr, brand));
        }
      }
      const mappedStations = allStations.slice(0, HOME_CAROUSEL_LIMIT);

      setBrands(mappedStations);
    } catch (err: any) {
      if (__DEV__) console.warn("[useBrands] Erreur de synchronisation API :", err?.message);
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