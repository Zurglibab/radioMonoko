import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "../global.css";

/**
 * RootLayout : Point d'entrée racine de l'application.
 * Définit la configuration globale du routing, le thème de la StatusBar
 * et l'import des styles globaux (Tailwind/NativeWind).
 */
export default function RootLayout() {
  return (
    <>
      {/* StatusBar globale */}
      <StatusBar style="light" />

      {/* Configuration du Stack Navigator principal :
        * headerShown: false pour utiliser nos propres headers personnalisés dans chaque écran.
        * animation: "fade" pour une transition fluide les flux (Auth, Splash, onboarding, etc.).
      */}
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>    
        {/* Point d'entrée initial */}
        <Stack.Screen name="index" />      
        {/* Écran de chargement/Splash screen au démarrage */}
        <Stack.Screen name="splash" />   
        {/* Flux de présentation (Onboarding) pour les nouveaux utilisateurs */}
        <Stack.Screen name="onboarding" />     
        {/* Groupe de navigation dédié à l'authentification (Login, Register) */}
        <Stack.Screen name="(auth)" />     
        {/* Layout principal de l'application après connexion (Tab Navigation) */}
        <Stack.Screen name="(tabs)" />      
      </Stack>
    </>
  );
}