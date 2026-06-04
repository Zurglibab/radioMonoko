import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import { NotificationService } from "@/services/notifications/notification.service";
import { mapNotificationDtoToApp } from "@/utils/mappers/notification.mapper";
import { AppNotification } from "@/types/content";

const POLL_INTERVAL = 30_000;

/**
 * useNotifications : Hook de gestion des notifications utilisateur.
 * 
 * Ce hook centralise la logique de récupération, mise à jour et marquage des notifications
 * pour l'utilisateur connecté. Il gère également le polling en arrière-plan lorsque l'app est active,
 * et suspend le polling lorsque l'app est en arrière-plan pour économiser les ressources.
 * @returns 
 */
export const useNotifications = () => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedForSession = useRef(false);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    if (!silent) setIsLoading(true);
    try {
      const dtos = await NotificationService.getUserNotifications(token, user.id);
      const mapped = dtos
        .map(mapNotificationDtoToApp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(mapped);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications]", err?.message);
      if (!silent) setError("Impossible de charger les notifications.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (isAuthLoading || !token || !user?.id) {
      if (!token) loadedForSession.current = false;
      return;
    }
    if (loadedForSession.current) return;
    loadedForSession.current = true;
    loadNotifications();
  }, [isAuthLoading, token, user?.id]);

  useEffect(() => {
    if (isAuthLoading || !token || !user?.id) return;

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        loadNotifications(true);
      }, POLL_INTERVAL);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        loadNotifications(true);
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [isAuthLoading, token, user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(token, id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAsRead échoué, rollback", err?.message);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(unread.map(n => NotificationService.markAsRead(token, n.id)));
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAllAsRead partiel", err?.message);
      loadNotifications(true);
    }
  }, [token, notifications, loadNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: loadNotifications,
  };
};