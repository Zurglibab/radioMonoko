import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import { NotificationService } from "@/services/notifications/notification.service";
import { mapNotificationDtoToApp } from "@/utils/mappers/notification.mapper";
import { AppNotification } from "@/types/content";

// Intervalle de mise à jour des notifications (30 secondes)
const POLL_INTERVAL = 30_000;

/**
 * useNotifications : Pilote le centre de notifications de l'utilisateur connecté.
 * 
 * - Charge les notifications via l'API et les mappe vers le modèle UI
 * - Implémente le "temps réel" via polling régulier (pausé en arrière-plan)
 * - Expose les actions markAsRead / markAllAsRead avec mise à jour optimiste
 */
export const useNotifications = () => {
  const { token, user, isLoading: isAuthLoading } = useAuthContext();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Réf pour éviter de relancer le polling à chaque changement de notifications
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Récupère les notifications depuis l'API. `silent` évite le spinner sur le polling.
   */
  const loadNotifications = useCallback(async (silent = false) => {
    if (!token || !user?.id) return;
    if (!silent) setIsLoading(true);
    try {
      const dtos = await NotificationService.getUserNotifications(token, user.id);
      // Tri chronologique inverse (plus récent en premier)
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

  // Chargement initial une fois l'auth prête
  useEffect(() => {
    if (isAuthLoading) return;
    loadNotifications();
  }, [isAuthLoading, loadNotifications]);

  // Polling, démarre un intervalle, le met en pause quand l'app passe en arrière-plan
  useEffect(() => {
    if (isAuthLoading || !token || !user?.id) return;

    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => loadNotifications(true), POLL_INTERVAL);
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Réagit aux changements d'état de l'app (foreground/background)
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        loadNotifications(true); // refresh immédiat au retour
        startPolling();
      } else {
        stopPolling(); // économise batterie et requêtes en arrière-plan
      }
    };

    startPolling();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [isAuthLoading, token, user?.id, loadNotifications]);

  /**
   * markAsRead : marque une notif comme lue (optimiste : UI d'abord, API ensuite).
   */
  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(token, id);
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAsRead échoué, rollback", err?.message);
      // Rollback si l'API échoue
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
    }
  }, [token]);

  /**
   * markAllAsRead : pas de route backend dédiée → on boucle sur les non-lues.
   */
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await Promise.all(unread.map(n => NotificationService.markAsRead(token, n.id)));
    } catch (err: any) {
      if (__DEV__) console.warn("[useNotifications] markAllAsRead partiel", err?.message);
      // En cas d'échec, on resynchronise avec le serveur
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