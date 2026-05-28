import { NotificationType } from "./content";

/**
 * NotificationDTO : Structure brute renvoyée par l'API /notifications.
 * Reflète exactement le format backend (snake_case, champs serveur).
 */
export interface NotificationDTO {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload de création POST /notifications.
 */
export interface CreateNotificationPayload {
  user_id: string;
  type: string;
  message: string;
  is_read?: boolean;
}

/**
 * Payload de mise à jour PUT /notifications/{id}.
 */
export interface UpdateNotificationPayload {
  type?: string;
  message?: string;
  is_read?: boolean;
}

/**
 * Liste des types reconnus par l'UI. Sert à normaliser le type freeform du backend.
 */
export const NOTIFICATION_TYPES: NotificationType[] = [
  'like', 'comment', 'follow', 'recommendation',
];