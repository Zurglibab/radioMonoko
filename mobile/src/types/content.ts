import { User } from "./auth";
export type MediaType = 'radio' | 'podcast';

export type MediaStatus = 'to-listen' | 'in-progress' | 'finished' | 'dropped';

/**
 * Interface BackendContent : Représente les contenus importés depuis le backend, tels que les shows, diffusions, lives, podcasts, articles ou autres.
 * Ces contenus sont référencés par la communauté et peuvent être ajoutés aux stations ou playlists.
 * Ils contiennent des informations de base comme le titre, la description, le type de contenu et les dates de création.
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
 * Interface ContentDTO : Modèle de données utilisé dans l'application pour représenter les contenus, enrichi avec des informations supplémentaires comme l'image, les avis, les amis qui écoutent, etc.
 * Il est dérivé de BackendContent mais adapté pour les besoins de l'interface utilisateur.
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
  brandId?: string;

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