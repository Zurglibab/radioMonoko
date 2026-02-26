import { Station } from "@/types/content";

/**
 * MOCK_STATIONS : Jeu de données de test.
 * Simule les données que l'API renverrait normalement.
 * L'utilisation d'URLs Unsplash permet de tester le rendu visuel avec de vraies images.
 */
const MOCK_STATIONS: Station[] = [
    {
        id: "1",
        title: "Jazz Night",
        description: "Le meilleur jazz contemporain et classique pour accompagner vos soirées.",
        imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop",
        isLive: true,
        category: "Jazz",
        ListenersCount: 1250
    },
    {
        id: "2",
        title: "Rock Classics",
        description: "Les plus grands classiques du rock des années 70 à aujourd'hui.",
        imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1000&auto=format&fit=crop",
        isLive: false,
        category: "Rock",
        ListenersCount: 890
    },
    {
        id: "3",
        title: "Python Podcast",
        description: "Des discussions approfondies sur Python et ses applications.",
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000&auto=format&fit=crop",
        isLive: false,
        category: "Tech",
        ListenersCount: 420
    }
];

/**
 * ContentService : Couche d'accès aux données de contenu.
 * Centralise tous les appels liés aux stations, podcasts et playlists.
 */
export const ContentService = {
    /**
     * Simule la récupération des stations de radio depuis une API.
     * @returns Promise<Station[]> : Liste des stations publiques après un délai réseau.
     */
    getPublicStations: async (): Promise<Station[]> => {
        return new Promise((resolve) => {
            // Simulation d'une latence réseau (1.2s) pour tester l'UX du loader
            setTimeout(() => {
                resolve(MOCK_STATIONS);
            }, 1200);
        });
    }
}