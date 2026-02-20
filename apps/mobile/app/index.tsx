import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getOnboardingSeen } from "@/services/onboarding/storage/onboarding.storage";

/**
 * Index - Point d'entrée décisionnel de l'application.
 * Ce composant gère l'aiguillage initial (Routing) en fonction de l'état 
 * du stockage local (Onboarding) et de la session utilisateur.
 */
export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    /**
     * Analyse l'état de l'application pour déterminer l'écran de destination.
     * 1. Vérifie si l'onboarding a été vu pour éviter de le montrer à nouveau.
     * 2. TODO: Vérifie l'authentification pour rediriger vers l'écran principal si déjà connecté.
     * 3. En fonction des résultats, redirige vers l'onboarding, le splash ou l'écran de bienvenue.
     */
    async function checkNavigationState() {
      try {
        // vérification de l'onboarding vu ou non 
        const seen = await getOnboardingSeen();
        setHasSeenOnboarding(seen);
        // TODO: Vérification de l'authentification (ex: token JWT, session active) 
      } catch (e) {
        // En cas d'erreur de lecture, on log pour le debug mais on laisse l'app continuer
        console.error("Erreur lors de l'initialisation du routage:", e);
      } finally {
        // On libère l'affichage une fois les vérifications terminées
        setIsLoading(false);
      }
    }

    checkNavigationState();
  }, []);

  /**
   * État de chargement :
   * AsyncStorage étant asynchrone, on affiche un loader pour éviter un flash blanc
   * ou une redirection erronée pendant la lecture des données.
   */
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  // Si l'utilisateur est authentifié, je le redirige vers l'écran principal
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Si l'utilisateur n'a pas vu l'onboarding, je le redirige vers l'onboarding
  if (!hasSeenOnboarding) {
    return <Redirect href="/splash" />;
  }

  // Par défaut, je redirige vers l'écran de bienvenue (ou d'authentification)
  return <Redirect href="/welcome" />;
}