import { Station, Playlist } from "@/types/content";
import { User } from "@/types/auth";

/**
 * UnifiedSearchResults : Structure de retour pour une recherche globale.
 * Regroupe les différents types de contenus pour un affichage en sections (Grille/Listes).
 */
export interface UnifiedSearchResults {
  stations: Station[];
  users: User[];
  playlists: Playlist[];
}

/**
 * SearchService : Couche de logique pour la découverte de contenu.
 * Gère la recherche transversale sur les œuvres, la communauté et les curateurs.
 */
export const SearchService = {
  /**
   * searchUnified : Recherche unifiée sur plusieurs sources de données.
   * Analyse la requête pour extraire les correspondances parmi les stations, 
   * les utilisateurs et les playlists publiques.
   * * @param query - La chaîne de caractères saisie par l'utilisateur.
   * @param allStations - Source de données locale pour les stations.
   * @returns Promise<UnifiedSearchResults> : Un objet structuré contenant les résultats filtrés.
   */
  searchUnified: async (query: string, allStations: Station[]): Promise<UnifiedSearchResults> => {
    return new Promise((resolve) => {
      /**
       * Simulation de latence réseau (400ms) :
       * Permet de tester la réactivité de l'UI et l'état de chargement global (Skeleton loaders).
       */
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();

        // Recherche par stations
        // Filtre les stations dont le titre, la catégorie ou l'artiste correspond à la requête.
        const stations = allStations.filter(s => 
          s.title.toLowerCase().includes(lowerQuery) || 
          s.category.toLowerCase().includes(lowerQuery) ||
          s.artist.toLowerCase().includes(lowerQuery)
        );

        // Recherche par utilisateurs
        // Filtre les profils publics dont le nom correspond à la requête.
        const mockUsers: User[] = [
          { id: 'u1', username: 'Alex_Monoko', email: 'alex@test.com', avatar: 'https://i.pravatar.cc/150?u=u1' },
          { id: 'u2', username: 'JazzLover', email: 'jazz@test.com' },
          { id: 'u3', username: 'RadioEdit_2026', email: 'edit@test.com' },
        ].filter(u => u.username.toLowerCase().includes(lowerQuery));

        // 3. Recherche par playlists
        // Filtre les collections publiques créées par les membres.
        const mockPlaylists: Playlist[] = [
          { id: 'pl1', name: 'Best of Rock 70s', creator: 'Pierre', isPublic: true, coverImage: 'https://picsum.photos/200', items: [], description: '', isCollaborative: false, createdAt: '' },
          { id: 'pl2', name: 'Jazz de Nuit', creator: 'JazzLover', isPublic: true, coverImage: 'https://picsum.photos/201', items: [], description: '', isCollaborative: false, createdAt: '' },
        ].filter(p => p.name.toLowerCase().includes(lowerQuery));

        // Retourne l'objet unifié pour une consommation directe par l'écran de recherche
        resolve({ 
          stations, 
          users: mockUsers, 
          playlists: mockPlaylists 
        });
      }, 400);
    });
  }
};