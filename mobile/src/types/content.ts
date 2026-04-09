import { User } from "./auth";

/**
 * Types de médias
 * Permet de distinguer le comportement de l'UI (ex: Badge "Direct" pour radio 
 * vs "Durée" pour podcast).
 */
export type MediaType = 'radio' | 'podcast';

/**
 * Status de lecteur de la collection
 * Définit l'état d'un média dans la bibliothèque de l'utilisateur.
 */
export type MediaStatus = 'to-listen' | 'in-progress' | 'finished' | 'dropped';

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
  artist: string;      // Nom du créateur, de la station ou du studio
  description: string;
  imageUrl: string;
  isLive: boolean;     // Indicateur de flux temps réel
  category: string;    // Genre ou thématique
  type: MediaType;     // Radio ou Podcast
  
  // Champs optionnels selon le contexte
  status?: MediaStatus; // Uniquement si présent dans la Library
  duration?: string;    // Affiché uniquement pour les podcasts
  listenersCount?: number;
  averageRating?: number;    // Note globale du réseau
  reviews?: Review[];        // Liste des critiques (Barème 2.2.3)
  friendsWhoListen?: User[]; // Liste d'amis (objets User complets)
}

/**
 * Interface Playlist : Conteneur de médias.
 * Gère la structure des listes créées par l'utilisateur ou la communauté.
 */
export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  items: Station[];     // Une playlist est une collection d'objets Station
  creator: string;      // Nom ou ID du créateur
  isPublic: boolean;    // Visibilité dans le flux communautaire
  isCollaborative: boolean;
  collaborators?: string[]; // Liste des IDs des utilisateurs autorisés
  createdAt: string;    // Date de création au format ISO
}