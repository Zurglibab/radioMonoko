import React, { createContext, useContext } from "react";
import { useNotifications } from "@/hooks/notifications/useNotifications";

/**
 * NotificationContext : Source unique de vérité pour les notifications.
 * 
 * Évite le double-polling : sans ce contexte, chaque composant appelant
 * useNotifications() (PrivateHeader, NotificationsScreen) lancerait son propre
 * timer. Ici, le polling tourne une seule fois et tous les consommateurs
 * partagent le même état (badge du header synchronisé avec l'écran).
 */
const NotificationContext = createContext<ReturnType<typeof useNotifications> | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useNotifications();
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