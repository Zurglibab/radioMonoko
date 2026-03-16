import { useState, useEffect } from "react";
import { Station } from "@/types/content";
import { SearchService } from "@/services/content/search.service";
import { useHome } from "./useHome";

/**
 * useSearch : Hook de gestion de la recherche et de l'historique.
 * Centralise la logique de filtrage asynchrone, le "debouncing" des entrées 
 * utilisateur et la persistance temporaire des recherches récentes.
 */
export const useSearch = () => {
  // Récupération de la source de vérité depuis le hook Home pour filtrer en local/cache
  const { stations: allStations } = useHome();
  
  // État de la saisie utilisateur
  const [query, setQuery] = useState("");
  // Résultats filtrés à afficher
  const [results, setResults] = useState<Station[]>([]);
  // Indicateur d'activité pour l'UI (ex: afficher un petit loader dans la barre)
  const [isSearching, setIsSearching] = useState(false);
  
  /**
   * État de l'historique :
   * Permet de suggérer les dernières stations consultées. 
   * Initialisé avec un tableau vide par défaut.
   */
  const [history, setHistory] = useState<Station[]>([]);

  /**
   * addToHistory : Ajoute une station aux recherches récentes.
   * Gère l'unicité (remonte l'élément si déjà présent) et limite la taille 
   * pour ne pas encombrer l'interface (Top 5).
   */
  const addToHistory = (station: Station) => {
    setHistory((prev) => {
      // On retire la station si elle était déjà présente pour la remettre en haut de pile
      const newHistory = prev.filter((s) => s.id !== station.id);
      // On garde les 5 éléments les plus récents uniquement
      return [station, ...newHistory].slice(0, 5);
    });
  };

  /**
   * clearHistory : Remise à zéro complète de la liste des recherches récentes.
   */
  const clearHistory = () => setHistory([]);

  /**
   * Effet de recherche avec Debounce (300ms) :
   * Évite de déclencher un filtrage à chaque touche pressée. 
   * Améliore les performances et économise les ressources (CPU/Réseau).
   */
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query) {
        setIsSearching(true);
        // Appel au service de recherche pour traiter la logique de matching
        const filtered = await SearchService.searchStations(query, allStations);
        setResults(filtered);
        setIsSearching(false);
      } else {
        // Si le champ est vide, on nettoie les résultats pour afficher l'historique ou rien
        setResults([]);
      }
    }, 300);

    // Nettoyage du timer si l'utilisateur tape une nouvelle lettre avant la fin du délai
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