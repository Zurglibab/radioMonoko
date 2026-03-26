/**
 * MediaType : Typage strict du contenu.
 * Permet de déclencher des affichages conditionnels (ex: icône 'Live' vs 'Temps restant').
 */
export type MediaType = 'radio' | 'podcast';

/**
 * MediaItem : Version légère du contenu pour la bibliothèque.
 * Cette interface est conçue pour être polyvalente et facile à manipuler 
 * dans des tableaux de favoris ou de playlists.
 */
export interface MediaItem {
  id: string;          // Identifiant unique (ex: UUID)
  title: string;       // Titre du morceau ou de l'émission
  artist: string;      // Nom du studio, de la radio ou de l'auteur
  imageUrl: string;    // URL de la pochette (optimisée pour les miniatures)
  type: MediaType;     // Distingue le flux continu du contenu à la demande
  // Propriétés optionnelles selon le type de média
  duration?: string;   // Ex: "42:10" (uniquement pour les podcasts)
  isLive?: boolean;    // Flag pour l'affichage du badge 'DIRECT'
}

/**
 * Playlist : Conteneur de collection utilisateur.
 * Structure complète pour l'affichage des écrans de détails de playlist.
 */
export interface Playlist {
  id: string;           // Identifiant unique de la playlist
  name: string;         // Nom choisi par l'utilisateur
  description: string;  // Petite note d'intention ou résumé
  coverImage: string;   // Image principale (souvent un montage des items)
  items: MediaItem[];   // Le cœur de la playlist : un tableau de médias
  creator: string;      // Identifiant ou Nom de l'utilisateur créateur
  createdAt: string;    // Date de création
}