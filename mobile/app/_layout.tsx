import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { NotificationProvider, useNotificationContext } from "@/context/NotificationContext";
import { PlayerProvider } from "@/context/PlayerContext";
import React, { useEffect } from "react";
import "../global.css";
import { MiniPlayer } from "@/features/player/components/MiniPlayer";
import { useColorScheme, Alert } from "react-native";

/**
 * NotificationWatcher : Composant invisible qui écoute les notifications globales
 * et déclenche des alertes à l'écran en temps réel lors du polling.
 */
function NotificationWatcher() {
  const { notifications } = useNotificationContext();
  const { user, token } = useAuthContext();

  useEffect(() => {
    if (!token || !user?.id || notifications.length === 0) return;

    const latestNotif = notifications[0];
    const isFresh = (Date.now() - new Date(latestNotif.timestamp).getTime()) < 45000;

    if (!latestNotif.isRead && isFresh) {
      Alert.alert(
        "Nouvelle notification 🔔",
        latestNotif.message,
        [{ text: "Fermer", style: "cancel" }]
      );
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
 * RootLayout : Point d'entrée de l'application.
 * Enveloppe l'application dans les providers nécessaires à la gestion
 * de l'état global (Auth, Notifications, Audio, Gestures).
 *
 * Ordre des providers important :
 * - AuthProvider en premier (source du token/user)
 * - NotificationProvider ensuite (dépend du token pour son polling)
 * - PlayerProvider (indépendant, peut être n'importe où sous Auth)
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