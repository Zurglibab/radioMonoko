import { apiFetch } from "@/utils/apiFetch";
import { 
  NotificationDTO, 
  UpdateNotificationPayload, 
  CreateNotificationPayload 
} from "@/types/notification";

/**
 * NotificationService : Communication avec l'API /notifications.
 * Toutes les routes renvoient/manipulent des NotificationDTO bruts (snake_case).
 * La transformation vers le modèle UI se fait via le mapper dans le hook.
 */
export const NotificationService = {
  /**
   * getUserNotifications : GET /notifications/user/{userId}
   * Récupère toutes les notifications d'un utilisateur (lues + non lues).
   */
  getUserNotifications: (token: string, userId: string): Promise<NotificationDTO[]> =>
    apiFetch<NotificationDTO[]>(`/notifications/user/${userId}`, { token }),

  /**
   * getUserUnread : GET /notifications/user/{userId}/unread
   * Récupère uniquement les notifications non lues (pour le badge de compteur).
   */
  getUserUnread: (token: string, userId: string): Promise<NotificationDTO[]> =>
    apiFetch<NotificationDTO[]>(`/notifications/user/${userId}/unread`, { token }),

  /**
   * markAsRead : PATCH /notifications/{id}/read
   * Bascule une notification spécifique en "lue".
   */
  markAsRead: (token: string, id: string): Promise<NotificationDTO> =>
    apiFetch<NotificationDTO>(`/notifications/${id}/read`, { token, method: 'PATCH' }),

  /**
   * remove : DELETE /notifications/{id}
   * Supprime définitivement une notification.
   */
  remove: (token: string, id: string): Promise<void> =>
    apiFetch<void>(`/notifications/${id}`, { token, method: 'DELETE' }),

  /**
   * update : PUT /notifications/{id}
   * Met à jour le contenu d'une notification (usage admin/système).
   */
  update: (token: string, id: string, payload: UpdateNotificationPayload): Promise<NotificationDTO> =>
    apiFetch<NotificationDTO>(`/notifications/${id}`, { token, method: 'PUT', body: payload }),

  /**
   * create : POST /notifications
   * Crée une notification (usage système, ex: backend déclenche sur un follow).
   */
  create: (token: string, payload: CreateNotificationPayload): Promise<NotificationDTO> =>
    apiFetch<NotificationDTO>('/notifications', { token, method: 'POST', body: payload }),
};