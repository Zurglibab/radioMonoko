import React, { useEffect } from "react";
import { Animated, Image, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * SplashScreen : Écran de transition au démarrage.
 * Gère l'apparition en fondu du logo et simule un temps de chargement
 * avant de rediriger l'utilisateur.
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

    // Redirection automatique après la fin de l'animation
    // TODO: Plus tard, remplacer ce timer par une vérification réelle (fonts, assets, auth)
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 1000);

    // Nettoyage du timer pour éviter les fuites de mémoire si le composant est démonté
    return () => clearTimeout(timer);
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