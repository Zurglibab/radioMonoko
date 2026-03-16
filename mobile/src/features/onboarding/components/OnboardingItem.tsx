import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { ImageBackground, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { OnboardingSlideModel } from "../data/slides";

type Props = {
  item: OnboardingSlideModel;
};

/**
 * OnboardingItem : Rendu individuel d'une slide du carrousel.
 * Optimisé avec React.memo pour la performance lors du scroll.
 * Utilise SafeAreaView et les tokens du thème pour une cohérence parfaite.
 */
function OnboardingItem({ item }: Props) {
  // Récupération des dimensions pour assurer un affichage plein écran strict
  const { width, height } = useWindowDimensions();

  return (
    <View 
      style={{ width, height, backgroundColor: theme.dark.colors.background }} 
    >
      {/* Image de fond couvrant l'intégralité du viewport.
          fadeDuration={0} : Supprime le fondu par défaut pour un affichage instantané 
          car l'image est déjà préchargée en mémoire vive via le point d'entrée Index.
      */}
      <ImageBackground
        source={item.image}
        style={{ width, height, flex: 1 }}
        resizeMode="cover"
        fadeDuration={0}
      >
        {/* Dégradé vertical utilisant la couleur de fond du thème pour la transition */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)", theme.dark.colors.background]}
          locations={[0, 0.4, 0.9]}
          style={{ flex: 1 }}
        >
          {/* SafeAreaView : Crucial sur iOS pour gérer les encoches et le home indicator.
              On aligne le contenu en bas (flex-end) avec un padding important (pb-48) 
              pour laisser l'espace nécessaire aux contrôles (Pagination & Bouton).
          */}
          <SafeAreaView 
            edges={['top', 'bottom']} 
            style={{ flex: 1, justifyContent: 'flex-end' }} 
            className="px-8 pb-48"
          >
            <View>
              {/* Titre de la slide - Couleur fixe blanche pour le contraste sur image */}
              <Text 
                className="text-5xl font-bold tracking-tighter text-white uppercase"
                style={{ lineHeight: 48 }}
              >
                {item.title}
              </Text>

              {/* Séparateur visuel utilisant le texte du thème ou blanc */}
              <View className="h-1 w-12 bg-white my-6" />

              {/* Description textuelle utilisant la couleur de texte du thème dark */}
              <Text 
                style={{ color: theme.dark.colors.text }}
                className="text-lg font-light leading-6 opacity-80"
              >
                {item.description}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// Export mémoïsé pour éviter les re-renders lors des animations de scroll
export default memo(OnboardingItem);