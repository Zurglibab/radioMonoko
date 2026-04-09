import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import { PlayerProvider } from "@/context/PlayerContext";
import React from "react";
import "../global.css";
import { MiniPlayer } from "@/features/player/components/MiniPlayer";
import { useColorScheme } from "react-native";

/**
 * AppContent : Le conteneur logique de l'application.
 * Séparé du RootLayout pour pouvoir consommer les Contextes (useAuthContext).
 * Gère l'apparence de la barre de statut et la structure de navigation.
 */
function AppContent() {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Adaptation de l'heure et des icônes système selon le thème */}
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* STACK NAVIGATION : Définition des routes principales */}
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        {/* Route d'entrée / Redirection */}    
        <Stack.Screen name="index" />
        {/* Chargement initial / Logo */}      
        <Stack.Screen name="splash" /> 
        {/* Tutoriel premier démarrage */}     
        <Stack.Screen name="onboarding" />
        {/* Login / Register */} 
        <Stack.Screen name="(auth)" />
        {/* Application principale (Home, Search, Library, Profile) */}      
        <Stack.Screen name="(tabs)" />      
      </Stack>

      {/* LE MINI PLAYER : 
          Placé ici, il flotte au-dessus de TOUTE la navigation. 
          L'utilisateur peut naviguer sans que la musique ne s'arrête. 
      */}
      <MiniPlayer /> 
    </GestureHandlerRootView>
  );
}

/**
 * RootLayout : Point d'entrée de l'application.
 * Enveloppe l'application dans les providers nécessaires à la gestion 
 * de l'état global (Auth, Audio, Gestures).
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider> 
        <AppContent />
      </PlayerProvider>
    </AuthProvider>
  );
}