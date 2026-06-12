import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import { NotificationService } from "@/services/notifications/notification.service";
import { mapNotificationDtoToApp } from "@/utils/mappers/notification.mapper";
import { AppNotification } from "@/types/content";
import { NotificationDTO } from "@/types/notification";
import { isInBackoff, triggerGlobalBackoff } from "@/utils/rateLimitGuard";
import { toArray } from "@/utils/apiFetch";

const POLL_INTERVAL = 30_000;

export const useNotifications = () => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadedForSession = useRef(false);

  const loadNotifications = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    if (isInBackoff()) return;
    if (!silent) setIsLoading(true);
    try {
      const raw = await NotificationService.getUserNotifications(token, user.id);
      const dtos = toArray<NotificationDTO>(raw);
      const mapped = dtos
        .map(mapNotificationDtoToApp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(mapped);
      setError(null);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications]", err?.message);
      if (err?.message === "HTTP 429") triggerGlobalBackoff();
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
  }, [isAuthLoading, token, user?.id, loadNotifications]);

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
      if (state === "active") {
        loadNotifications(true);
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [isAuthLoading, token, user?.id, loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(token, id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAsRead rollback", err?.message);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token || !user?.id) return;
    const hasUnread = notifications.some(n => !n.isRead);
    if (!hasUnread) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await NotificationService.markAllAsRead(token, user.id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAllAsRead failed", err?.message);
      loadNotifications(true);
    }
  }, [token, user?.id, notifications, loadNotifications]);

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
