import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import NotificationsService from "../services/NotificationsService.ts";

export interface NotificationDto {
    id: string;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    createdAt: string;
}

export interface AppNotification {
    id: string;
    message: string;
    isRead: boolean;
    timestamp: string;
    type: 'like' | 'dislike' | 'reply' | 'system';
}

const mapNotificationDtoToApp = (dto: NotificationDto): AppNotification => ({
    id: dto.id,
    message: dto.message,
    isRead: dto.is_read,
    timestamp: dto.createdAt,
    type: dto.type as 'like' | 'dislike' | 'reply' | 'system'
});

const POLL_INTERVAL = 30_000;

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<number | null>(null);

    const loadNotifications = useCallback(async (silent = false) => {
        const token = localStorage.getItem('token');
        if (!token || !user?.id) return;

        if (!silent) setIsLoading(true);
        try {
            const dtos = await NotificationsService.getUserNotifications(user.id);
            const mapped = (dtos || [])
                .map(mapNotificationDtoToApp)
                .sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setNotifications(mapped);
            setError(null);
        } catch (err: any) {
            if (!silent) setError("Impossible de charger les notifications.");
            return err;
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user) loadNotifications();
    }, [user, loadNotifications]);

    useEffect(() => {
        if (!user) return;

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

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                loadNotifications(true);
                startPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user, loadNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await NotificationsService.markAsRead(id);
        } catch (err: any) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
            return err;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await NotificationsService.markAllAsRead(user.id);
        } catch (err: any) {
            loadNotifications(true);
            return err;
        }
    }, [user?.id, loadNotifications]);

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refetch: loadNotifications,
    };
};