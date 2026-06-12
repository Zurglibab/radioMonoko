import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getOnboardingSeen } from "@/services/onboarding/storage/onboarding.storage";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Index - Point d'entrée décisionnel de l'application.
 * Ce composant gère l'aiguillage initial (Routing) en fonction de l'état
 * du stockage local (Onboarding) et de la session utilisateur.
 */
export default function Index() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuthContext();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    /**
     * Vérifie si l'onboarding a déjà été vu pour éviter de le montrer à nouveau.
     */
    async function checkOnboarding() {
      try {
        const seen = await getOnboardingSeen();
        setHasSeenOnboarding(seen);
      } catch (e) {
        // En cas d'erreur de lecture, on log pour le debug mais on laisse l'app continuer
        console.error("Erreur lors de l'initialisation du routage:", e);
      } finally {
        setIsCheckingOnboarding(false);
      }
    }

    checkOnboarding();
  }, []);

  /**
   * État de chargement :
   * On attend à la fois la lecture de l'onboarding (AsyncStorage) et la restauration
   * de la session (AuthContext) pour éviter un flash blanc ou une redirection erronée.
   */
  if (isCheckingOnboarding || isAuthLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  // Si une session valide a été restaurée, je redirige directement vers l'écran principal
  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Si l'utilisateur n'a pas vu l'onboarding, je le redirige vers l'onboarding
  if (!hasSeenOnboarding) {
    return <Redirect href="/splash" />;
  }

  // Par défaut, je redirige vers l'écran de bienvenue (ou d'authentification)
  return <Redirect href="/welcome" />;
}