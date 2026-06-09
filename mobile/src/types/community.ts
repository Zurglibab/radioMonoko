/**
 * Types liés à la communauté : critiques, commentaires, activités sociales.
 * 
 * Ces types définissent les structures de données utilisées pour représenter
 * les critiques d'œuvres, les commentaires associés, et les activités sociales
 * (likes, follows) dans l'application. Ils sont essentiels pour assurer une
 * cohérence entre les différentes parties de l'app qui manipulent ces données.
 */
export type ActivityType = 'RATING' | 'REVIEW' | 'FOLLOW';

/**
 * ReviewComment : Modèle d'un commentaire sur une critique.
 * Un commentaire peut être une réponse à une critique ou à un autre commentaire.
 * Il contient des informations sur l'auteur, le contenu, les likes, et les
 * éventuelles réponses associées.
 */
export interface ReviewComment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  text: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  parentId?: string;
  replyTo?: string;
  replyToUserId?: string;
  repliesCount?: number;
}

/**
 * Review : Modèle d'une critique d'œuvre.
 * Il contient des informations sur l'auteur, la note, le contenu de la critique,
 * les likes, et les commentaires associés. Ce modèle est utilisé pour afficher
 * les critiques dans les différentes sections de l'app (profil, feed, etc.).
 */
export interface Review {
  id: string;
  userId: string;
  username: string;
  stationId: string;
  rating: number;
  content: string;
  likes: number;
  timestamp: string;
  comments: ReviewComment[];
}

/**
 * SocialActivity : Modèle d'une activité sociale dans le feed.
 * Représente une action d'un utilisateur (publication d'une critique, like, follow)
 * qui peut être affichée dans le feed d'activité. Contient des informations sur
 * l'utilisateur, le type d'activité, le contenu associé, les likes, et les
 * commentaires.
 */
export interface SocialActivity {
  id: string;
  userId: string;
  user: string;
  avatar?: string;
  type: ActivityType;
  targetMedia: string;
  contentId?: string;
  value?: number;
  text?: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
}