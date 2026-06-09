import React, { createContext, useContext, useMemo } from "react";
import { useNotifications } from "../hooks/useNotifications.ts";

const NotificationContext = createContext<ReturnType<typeof useNotifications> | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notificationsApi = useNotifications();
    const value = useMemo(() => notificationsApi, [
        notificationsApi.notifications,
        notificationsApi.unreadCount,
        notificationsApi.isLoading,
        notificationsApi.error,
        notificationsApi.markAsRead,
        notificationsApi.markAllAsRead,
        notificationsApi.refetch
    ]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error("useNotificationContext doit être utilisé à l'intérieur d'un NotificationProvider");
    }
    return ctx;
};