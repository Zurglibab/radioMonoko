import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { ImageBackground, Text, useWindowDimensions, View } from "react-native";
import { theme } from "@/constants/theme";
import { OnboardingSlideModel } from "../data/slides";

type Props = {
  item: OnboardingSlideModel;
};

/**
 * OnboardingItem : Rendu individuel d'une slide du carrousel.
 * Ce composant est optimisé avec React.memo pour éviter des re-renders inutiles lors du scroll.
 * Il utilise ImageBackground pour superposer un dégradé et du texte sur l'image de fond.
 */
function OnboardingItem({ item }: Props) {
  // Récupération dynamique des dimensions pour que chaque slide occupe 100% du viewport
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ width, height }} className="bg-background">
      {/* Image de fond, on utilise ImageBackground pour superposer le contenu facilement */}
      <ImageBackground
        source={item.image}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Dégradé vertical : 
            1. 'transparent' en haut pour voir l'image
            2. Opacité intermédiaire au milieu
            3. Couleur de fond du thème en bas pour une transition douce
        */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.4)",
            theme.dark.colors.background 
          ]}
          locations={[0, 0.5, 0.9]} // Points d'arrêt du dégradé
          style={{ flex: 1, justifyContent: "flex-end" }}
          className="px-8 pb-40" // Espacement généreux en bas pour laisser de la place au Paginator/Boutons
        > 
          <View>
            {/* Titre */}
            <Text 
              className="text-5xl font-bold tracking-tighter text-white uppercase"
              style={{ lineHeight: 48 }}
            >
              {item.title}
            </Text>

            {/* Séparateur visuel */}
            <View className="h-1 w-12 bg-white my-6" />

            {/* Description */}
            <Text className="text-lg text-gray-300 font-light leading-6">
              {item.description}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// Export avec mémoïsation pour les performances du carrousel
export default memo(OnboardingItem);