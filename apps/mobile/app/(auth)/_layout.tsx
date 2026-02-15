import { Stack } from "expo-router";
import React from "react";

/**
 * AuthLayout : Gestionnaire de navigation pour le flux d'authentification.
 * Ce layout regroupe tous les écrans liés à l'accès utilisateur (Connexion, Inscription, Récupération).
 */
export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, // On masque le header natif pour utiliser nos composants personnalisés
        animation: "fade"   // Animation par défaut en fondu pour un aspect fluide et moderne
      }}
    >
      {/* Écran pivot qui oriente l'utilisateur entre login et register */}
      <Stack.Screen name="welcome" />    

      {/* Flux d'entrée */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />

      {/* Flux de récupération de compte :
          J'utilise 'slide_from_right' pour ces écrans afin de donner une sensation de 
          progression étape par étape.
      */}
      <Stack.Screen 
        name="verify-code" 
        options={{ animation: "slide_from_right" }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ animation: "slide_from_right" }} 
      />
      <Stack.Screen 
        name="new-password" 
        options={{ animation: "slide_from_right" }} 
      />
    </Stack>
  );
}