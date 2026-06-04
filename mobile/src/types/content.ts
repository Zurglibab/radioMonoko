import { User } from "./auth";

/**
 * MediaType : Type de média pour différencier les flux radio des podcasts.
 * Utilisé pour adapter l'UI et les fonctionnalités (ex : affichage de la durée pour les podcasts).
 */
export type MediaType = 'radio' | 'podcast';

/**
 * Status de lecteur de la collection
 * Définit l'état d'un média dans la bibliothèque de l'utilisateur.
 */
export type MediaStatus = 'to-listen' | 'in-progress' | 'finished' | 'dropped';

/**
 * BackendContent : Représente la structure d'un contenu tel que renvoyé par le backend.
 * Utilisé pour enrichir les favoris et les items de la bibliothèque avec les métadonnées complètes.
 */
export interface BackendContent {
  id: string;
  api_id: string;
  title: string;
  description: string | null;
  content_type: 'show' | 'diffusion' | 'live' | 'podcast' | 'article' | 'other';
  created_at: string;
}

/**
 * Interface Review : Représente une critique ou un avis laissé par un utilisateur sur une station ou une playlist.
 * Utilisée pour afficher les retours de la communauté et favoriser l'engagement.
 */
export interface Review {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number; // 1 à 5
  comment: string;
  likes: number;
  createdAt: string;
}

/**
 * Interface Station : Le modèle de données atomique.
 * Il sert à la fois pour le catalogue public et pour les items de la bibliothèque.
 */
export interface Station {
  id: string;
  title: string;
  artist: string;
  description: string;
  imageUrl: string;
  isLive: boolean;
  category: string;
  type: MediaType;
  streamUrl?: string;

  status?: MediaStatus;
  duration?: string;
  listenersCount?: number;
  averageRating?: number;
  reviews?: Review[];
  friendsWhoListen?: User[];
}

/**
 * Interface Playlist : Conteneur de médias.
 * Gère la structure des listes créées par l'utilisateur ou la communauté.
 */
export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  items: Station[];
  creator: string;
  isPublic: boolean;
  isCollaborative: boolean;
  collaborators?: string[];
  createdAt: string;
}

/**
 * Types de notifications
 */
export type NotificationType = 'like' | 'comment' | 'follow' | 'recommendation';

/**
 * Interface AppNotification : Modèle de données pour les notifications.
 */
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedUser?: string;
  targetId?: string;
}