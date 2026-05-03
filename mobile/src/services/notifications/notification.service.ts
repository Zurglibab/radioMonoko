import { AppNotification } from "@/types/content";

/**
 * MOCK_NOTIFICATIONS : Base de données locale simulée.
 * Ces données couvrent les trois piliers du barème SUPCONTENT :
 * 1. Social (Like)
 * 2. Réseau (Follow)
 * 3. Recommandation (Taste-based)
 */
let mockNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'like',
    title: 'Nouveau J\'aime',
    message: 'Marc a aimé votre critique sur Jazz Night.',
    timestamp: new Date().toISOString(), // Notification instantanée
    isRead: false,
    relatedUser: 'Marc'
  },
  {
    id: '2',
    type: 'follow',
    title: 'Nouvel abonné',
    message: 'Sophie a commencé à vous suivre.',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // Il y a 1h
    isRead: false,
    relatedUser: 'Sophie'
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Recommandation',
    message: 'Un nouvel album de votre artiste favori est disponible.',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Hier
    isRead: true
  }
];

/**
 * NotificationService : Gère le cycle de vie des alertes utilisateur.
 * Implémente la récupération asynchrone et la mise à jour de l'état de lecture.
 */
export const NotificationService = {
  
  /**
   * getNotifications : Récupère la liste des notifications.
   * Simule une latence réseau pour permettre l'affichage d'un loader côté Front.
   */
  getNotifications: async (): Promise<AppNotification[]> => {
    return new Promise((resolve) => {
      // Simulation d'un délai de réponse serveur de 800ms
      setTimeout(() => resolve([...mockNotifications]), 800);
    });
  },
  
  /**
   * markAsRead : Bascule le statut d'une notification spécifique en "lu".
   */
  markAsRead: async (id: string): Promise<void> => {
    mockNotifications = mockNotifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
  },

  /**
   * markAllAsRead : Action de masse pour nettoyer le centre de notifications.
   */
  markAllAsRead: async (): Promise<void> => {
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
  }
};