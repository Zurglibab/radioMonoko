import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { NotificationProvider, useNotificationContext } from "@/context/NotificationContext";
import { PlayerProvider } from "@/context/PlayerContext";
import React, { useEffect, useRef } from "react";
import "../global.css";
import { MiniPlayer } from "@/features/player/components/MiniPlayer";
import { useColorScheme, Alert } from "react-native";

// Composant invisible qui déclenche une alerte pour chaque nouvelle notification non lue et fraîche.
// Le Set shownIds évite de réafficher la même alerte à chaque re-render.
function NotificationWatcher() {
  const { notifications } = useNotificationContext();
  const { user, token } = useAuthContext();
  const shownIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token || !user?.id || notifications.length === 0) return;

    for (const notif of notifications) {
      if (notif.isRead || shownIds.current.has(notif.id)) continue;
      const isFresh = (Date.now() - new Date(notif.timestamp).getTime()) < 45_000;
      if (!isFresh) continue;

      shownIds.current.add(notif.id);
      Alert.alert(
        "Nouvelle notification",
        notif.message,
        [{ text: "Fermer", style: "cancel" }]
      );
      break; // une alerte à la fois pour ne pas spammer
    }
  }, [notifications, token, user?.id]);

  return null;
}

/**
 * AppContent : Le conteneur logique de l'application.
 * Séparé du RootLayout pour pouvoir consommer les Contextes (useAuthContext).
 */
function AppContent() {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <NotificationWatcher />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <MiniPlayer />
    </GestureHandlerRootView>
  );
}

/**
 * RootLayout : Le layout racine de l'application.
 * Il enveloppe l'ensemble de l'application avec les Context Providers nécessaires (Auth, Notification, Player).
 * C'est le point d'entrée de l'application où les Contextes sont initialisés et disponibles pour tous les composants enfants.
 * @returns 
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}