import { useState, useEffect } from "react";
import { Station } from "@/types/content";
import { BrandService } from "@/services/brand/brand.service";
import { mapBrandToStation } from "@/utils/mappers/brand.mapper";

export const useBrands = () => {
  const [brands, setBrands] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * loadBrands : Fonction de chargement des stations depuis l'API.
   * Gère les états de chargement et d'erreur pour une expérience utilisateur fluide.
   * Transforme les données brutes du back en objets Station adaptés à l'UI.
   */
  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // On récupère les données brutes de l'API
      const responseData: any = await BrandService.fetchAllBrands();
      
      // Validation de la structure de la réponse avant de mapper les données
      const rawBrands = responseData?.data;

      if (!Array.isArray(rawBrands)) {
        throw new Error("Le serveur n'a pas renvoyé le tableau de données attendu.");
      }
      
      // Mapping des données brutes en objets Station pour l'UI
      const mappedStations = rawBrands.map((item: any) => mapBrandToStation(item));
      
      // On limite à 5 stations pour le carrousel de la Home
      setBrands(mappedStations.slice(0, 5));
    } catch (err: any) {
      console.error("[useBrands] Erreur de synchronisation API :", err);
      setError(err.message || "Une erreur est survenue lors du chargement des stations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return {
    brands,
    isLoading,
    error,
    refetch: loadBrands
  };
};