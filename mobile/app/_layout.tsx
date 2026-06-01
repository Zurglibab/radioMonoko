import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { PlayerProvider } from "@/context/PlayerContext";
import React from "react";
import "../global.css";
import { MiniPlayer } from "@/features/player/components/MiniPlayer";
import { useColorScheme } from "react-native";

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