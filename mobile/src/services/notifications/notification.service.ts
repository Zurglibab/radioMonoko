import { apiFetch } from "@/utils/apiFetch";
import { NotificationDTO, CreateNotificationPayload } from "@/types/notification";

export const NotificationService = {
  getUserNotifications: (token: string, userId: string): Promise<NotificationDTO[]> =>
    apiFetch<NotificationDTO[]>(`/notifications/user/${userId}`, { token }),

  markAsRead: (token: string, id: string): Promise<NotificationDTO> =>
    apiFetch<NotificationDTO>(`/notifications/${id}/read`, { token, method: 'PATCH' }),

  markAllAsRead: (token: string, userId: string): Promise<NotificationDTO[]> =>
    apiFetch<NotificationDTO[]>(`/notifications/user/${userId}/read-all`, { token, method: 'PATCH' }),

  create: (token: string, payload: CreateNotificationPayload): Promise<NotificationDTO> =>
    apiFetch<NotificationDTO>('/notifications', { token, method: 'POST', body: payload }),
};
