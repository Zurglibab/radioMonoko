import { Station } from "@/types/content";

/**
 * SearchService : Couche de logique pour la recherche de contenu.
 * Centralise les algorithmes de filtrage et les futures requêtes API 
 * liées à la découverte de stations.
 */
export const SearchService = {
  /**
   * searchStations : Filtre la liste des stations selon une requête textuelle.
   * La recherche est insensible à la casse et porte sur le titre et la catégorie.
   * * @param query - La chaîne de caractères saisie par l'utilisateur.
   * @param allStations - La source de données complète à filtrer.
   * @returns Promise<Station[]> : Les résultats correspondants après un court délai.
   */
  searchStations: async (query: string, allStations: Station[]): Promise<Station[]> => {
    return new Promise((resolve) => {
      /**
       * Simulation de délai (300ms) :
       * Utile pour valider le comportement du loaders et simuler 
       * un temps de réponse serveur réaliste.
       */
      setTimeout(() => {
        const results = allStations.filter(s => 
          // Comparaison en minuscules pour éviter les problèmes de casse
          s.title.toLowerCase().includes(query.toLowerCase()) || 
          s.category.toLowerCase().includes(query.toLowerCase())
        );
        
        resolve(results);
      }, 300);
    });
  }
};