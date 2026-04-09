import { Station, MediaType, Review } from "@/types/content";
import { User } from "@/types/auth";

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
 * MOCK_REVIEWS : Base de données sociale simulée.
 */
const MOCK_REVIEWS: Record<string, Review[]> = {
  "1": [
    { id: "rev1", userId: "u2", username: "Marie", rating: 5, comment: "Incroyable !", likes: 12, createdAt: "2026-04-01" },
    { id: "rev2", userId: "u3", username: "Lucas", rating: 4, comment: "Top pour bosser.", likes: 5, createdAt: "2026-04-02" }
  ],
  "r1": [
    { id: "rev3", userId: "u1", username: "Alex", rating: 5, comment: "La base du rock.", likes: 24, createdAt: "2026-04-05" }
  ]
};

/**
 * MOCK_FRIENDS : Simule les relations sociales (Barème Follow/Social)
 */
const MOCK_FRIENDS: User[] = [
  { id: 'u1', username: 'Alex', email: 'alex@radio.fr', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'u2', username: 'Marie', email: 'marie@radio.fr', avatar: 'https://i.pravatar.cc/150?u=marie' },
  { id: 'u3', username: 'Lucas', email: 'lucas@radio.fr', avatar: 'https://i.pravatar.cc/150?u=lucas' },
];

export const ContentService = {
  getPublicStations: async (): Promise<Station[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fullStations: Station[] = MOCK_STATIONS_RAW.map(s => ({
          ...s,
          type: s.title.toLowerCase().includes('podcast') ? 'podcast' : 'radio',
          artist: "RadioMonoco", 
          isLive: s.listenersCount ? s.listenersCount > 1000 : false,
        }));
        resolve(fullStations);
      }, 1000);
    });
  },

  /**
   * getMediaMetrics : Calcule les stats sociales d'une fiche.
   * Récupère aussi les avatars des amis pour l'aspect "Réseau Social".
   */
  getMediaMetrics: (mediaId: string) => {
    const reviews = MOCK_REVIEWS[mediaId] || [];
    const count = reviews.length;
    const avg = count > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / count 
      : 0;
    
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      reviewsCount: count,
      reviews: reviews,
      friendsWhoListen: MOCK_FRIENDS.slice(0, 2) // Simule 2 amis sur ce média
    };
  },

  /**
   * getUserStats : Calcule les métriques globales du Dashboard (Barème 2.2.2).
   */
  getUserStats: (content: any[]) => {
    const ratings = content.filter(item => item.myRating).map(item => item.myRating);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    return {
      totalListened: content.filter(m => m.status === 'finished').length,
      friendsCount: 42,
      avgRatingGiven: parseFloat(avgRating.toFixed(1)) || 0,
      totalHours: "124h"
    };
  }
};