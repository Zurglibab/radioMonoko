/**
 * ActivityType : Définit la nature d'une action sociale.
 * Permet au Fil d'actualité (Feed) d'adapter le rendu visuel.
 * - RATING : L'utilisateur a juste mis des étoiles.
 * - REVIEW : L'utilisateur a écrit une critique textuelle.
 * - FOLLOW : L'utilisateur a suivi quelqu'un.
 */
export type ActivityType = 'RATING' | 'REVIEW' | 'FOLLOW';

/**
 * ReviewComment : Structure d'un commentaire sous une critique.
 * Permet d'animer les discussions autour des critiques.
 * Chaque commentaire est lié à une critique spécifique via l'ID de la critique.
 */
export interface ReviewComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

/**
 * Review : Modèle complet d'une critique d'œuvre.
 * C'est l'objet central qui lie un utilisateur RadioMonoco à une œuvre (API tierce).
 */
export interface Review {
  id: string;
  userId: string;
  username: string;
  stationId: string; // Lien avec l'ID de la Radio/Podcast
  rating: number;    // Note de 1 à 5 étoiles
  content: string;   // Texte formaté de la critique
  likes: number;     // Compteur de "J'aime"
  timestamp: string; // Date de publication
  comments: ReviewComment[]; // Discussions associées
}

/**
 * SocialActivity : Objet pivot pour le Fil d'actualité.
 * Conçu pour être affiché de manière chronologique inverse.
 * Il agrège les informations essentielles pour une "ActivityCard" sans charger
 * toute la lourdeur d'une Review complète si ce n'est pas nécessaire.
 */
export interface SocialActivity {
  id: string;
  user: string;       // Nom de l'acteur
  avatar?: string;    // Image de profil pour l'aspect réseau social
  type: ActivityType; // Type d'action (Badge visuel)
  targetMedia: string; // Titre du média concerné (Radio ou Podcast)
  value?: number;      // Note (si type RATING ou REVIEW)
  text?: string;       // Extrait de la critique (si type REVIEW)
  timestamp: string;
  likes: number;       // Score d'engagement
  commentsCount: number; // Nombre de commentaires
}