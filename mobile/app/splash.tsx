import React, { useEffect } from "react";
import { Animated, Image, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { preloadAppAssets } from "@/features/onboarding/data/slides"; 

/**
 * SplashScreen : Écran de transition au démarrage.
 * Gère l'apparition en fondu du logo et précharge les assets lourds (images)
 * avant de rediriger l'utilisateur vers l'onboarding.
 */
export default function SplashScreen() {
  const router = useRouter();
  
  // Utilisation d'une Animated.Value unique pour piloter l'opacité ET le mouvement
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animation d'entrée, fondu progressif de 1 seconde
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true, // Optimisation CPU, l'animation tourne du côté natif
    }).start();

    /**
     * Préparation des ressources :
     * On précharge les images de l'onboarding pendant que l'animation tourne.
     * Cela évite les écrans noirs au démarrage et les lags sur l'onboarding.
     */
    async function prepareAssets() {
      try {
        // J'attend à la fois le préchargement et un délai minimum pour l'expérience visuelle
        await Promise.all([
          preloadAppAssets(),
          new Promise(resolve => setTimeout(resolve, 2500)), // Assure que le splash reste visible au moins 2.5 secondes
        ]);
      } catch (e) {
        console.warn("Erreur chargement assets:", e);
      } finally {
        // Redirection une fois que tout est prêt
        router.replace("/onboarding");
      }
    }

    prepareAssets();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <StatusBar style="light" />
      
      {/* Logo animé en opacité */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image 
          source={require("@/assets/images/logo/logo.png")} 
          style={{ width: 250, height: 120 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Barre de progression subtile en bas de l'écran */}
      <View className="absolute bottom-16">
        <View className="h-[2px] w-12 bg-white/20 overflow-hidden">
          <Animated.View 
            className="h-full bg-white w-full" 
            style={{ 
              transform: [{ 
                // Synchronisation du mouvement de la barre avec le fondu du logo
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0] // Je déplace la barre de gauche à droite
                }) 
              }] 
            }} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}