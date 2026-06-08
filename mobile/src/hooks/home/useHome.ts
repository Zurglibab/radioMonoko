import { useState, useEffect, useCallback } from "react";
import { Station } from "@/types/content";
import { BrandService } from "@/services/brand/brand.service";
import { mapBrandToStation, mapWebRadioToStation } from "@/utils/mappers/brand.mapper";

const PUBLIC_LIMIT = 10;

/**
 * useHome : Récupère les stations publiques pour l'écran d'accueil non authentifié.
 * Utilise le service brands.
 */
export const useHome = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const brands = await BrandService.fetchAllBrands();
      const all: Station[] = [];
      for (const brand of brands) {
        if (brand.liveStream) all.push(mapBrandToStation(brand));
        for (const wr of brand.webRadios ?? []) {
          all.push(mapWebRadioToStation(wr, brand));
        }
      }
      setStations(all.slice(0, PUBLIC_LIMIT));
    } catch {
      setError("Erreur lors du chargement des stations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { stations, isLoading, error, refresh: fetchContent };
};
