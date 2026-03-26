import { Station, MediaType } from "@/types/content";

/**
 * MOCK_STATIONS_RAW : Données brutes.
 * Simule une réponse d'API minimaliste qui ne contient que le strict nécessaire.
 */
const MOCK_STATIONS_RAW = [
  {
    id: "1",
    title: "Jazz Night",
    description: "Le meilleur jazz contemporain.",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629",
    category: "Jazz",
    listenersCount: 1250
  },
  {
    id: "3",
    title: "Python Podcast",
    description: "Apprendre le code en écoutant.",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    category: "Tech",
    listenersCount: 420
  }
];

/**
 * ContentService : Couche de transformation de données.
 * Centralise la logique pour rendre les données compatibles avec l'UI de RadioMonoko.
 */
export const ContentService = {
  /**
   * getPublicStations : Récupère et enrichit les stations.
   * @returns Promise<Station[]> : Liste des stations typées et formatées.
   */
  getPublicStations: async (): Promise<Station[]> => {
    return new Promise((resolve) => {
      // Simulation d'un temps de réponse serveur de 1 seconde
      setTimeout(() => {
        
        /**
         * Automatisation et mapping :
         * On parcourt les données brutes pour construire des objets Station complets.
         */
        const fullStations: Station[] = MOCK_STATIONS_RAW.map(s => ({
          ...s,
          // Logique métier : On déduit le type de média selon le titre
          type: s.title.toLowerCase().includes('podcast') ? 'podcast' : 'radio',
          
          // Valeur par défaut : On assure que la propriété 'artist' n'est jamais vide
          artist: "RadioMonoco", 
          
          // Déduction de l'état : Une station est considérée 'Live' si elle dépasse un seuil d'audience
          isLive: s.listenersCount ? s.listenersCount > 1000 : false,
        }));

        resolve(fullStations);
      }, 1000);
    });
  }
};