import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getOnboardingSeen } from "@/services/onboarding/storage/onboarding.storage";
import { useAuthContext } from "@/context/AuthContext";

export default function Index() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuthContext();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const seen = await getOnboardingSeen();
        setHasSeenOnboarding(seen);
      } catch (e) {
        console.error("Erreur lors de l'initialisation du routage:", e);
      } finally {
        setIsCheckingOnboarding(false);
      }
    }

    checkOnboarding();
  }, []);

  if (isCheckingOnboarding || isAuthLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center' }}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <Redirect href="/(tabs)/home" />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/splash" />;
  }

  return <Redirect href="/welcome" />;
}