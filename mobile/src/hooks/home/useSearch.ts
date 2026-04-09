import { useState, useEffect } from "react";
import { SearchService, UnifiedSearchResults } from "@/services/content/search.service";
import { useHome } from "./useHome";
import { Station } from "@/types/content";

/**
 * useSearch : Hook de gestion de la recherche globale et de l'historique.
 * Pilote le filtrage asynchrone multi-entités (Stations, Users, Playlists),
 * gère le "debouncing" et persiste l'historique des consultations récentes.
 */
export const useSearch = () => {
  // Récupération de la source de vérité pour le filtrage local des stations
  const { stations: allStations } = useHome();
  
  // État de la saisie textuelle
  const [query, setQuery] = useState("");
  
  // Résultats de recherche structurés par catégories (Unified)
  const [results, setResults] = useState<UnifiedSearchResults>({
    stations: [],
    users: [],
    playlists: []
  });
  
  // Indicateur de chargement pour le feedback visuel (Skeleton ou Spinner)
  const [isSearching, setIsSearching] = useState(false);
  
  /**
   * État de l'historique :
   * Conserve les dernières stations sélectionnées pour un accès rapide.
   */
  const [history, setHistory] = useState<Station[]>([]);

  /**
   * addToHistory : Enregistre un item dans les recherches récentes.
   * Assure l'unicité (remonte l'élément) et limite la liste aux 5 entrées les plus fraîches.
   */
  const addToHistory = (item: Station) => {
    setHistory((prev) => {
      // Suppression des doublons pour placer le dernier consulté en haut de liste
      const filtered = prev.filter((s) => s.id !== item.id);
      return [item, ...filtered].slice(0, 5);
    });
  };

  /**
   * clearHistory : Purge complète de l'historique de recherche local.
   */
  const clearHistory = () => setHistory([]);

  /**
   * Effet de recherche unifiée avec Debounce (300ms) :
   * Déclenche l'appel au SearchService uniquement après une pause dans la saisie.
   * Optimise les cycles de rendu et simule un comportement de recherche serveur.
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // On ignore les espaces vides pour éviter les requêtes inutiles
      if (query.trim()) {
        setIsSearching(true);
        
        // Exécution de la recherche unifiée (Stations, Users, Playlists)
        const unifiedResults = await SearchService.searchUnified(query, allStations);
        setResults(unifiedResults);
        
        setIsSearching(false);
      } else {
        // Reset des résultats pour laisser place à l'affichage de l'historique
        setResults({ stations: [], users: [], playlists: [] });
      }
    }, 300);

    // Nettoyage : annule le déclenchement si l'utilisateur continue de taper
    return () => clearTimeout(delayDebounceFn);
  }, [query, allStations]);

  return { 
    query, 
    setQuery, 
    results, 
    isSearching, 
    history, 
    addToHistory, 
    clearHistory 
  };
};