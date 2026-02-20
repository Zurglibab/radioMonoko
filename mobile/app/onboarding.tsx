import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Check } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Animated, FlatList, Text, TouchableOpacity, View } from "react-native";

import { theme } from "@/constants/theme";
import OnboardingItem from "@/features/onboarding/components/OnboardingItem";
import Paginator from "@/features/onboarding/components/Paginator";
import { ONBOARDING_SLIDES } from "@/features/onboarding/data/slides";
import { setOnboardingSeen } from "@/services/onboarding/storage/onboarding.storage";

/**
 * OnboardingScreen : Gère le carrousel de présentation.
 * Utilise une FlatList horizontale avec pagination pour présenter les features.
 */
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Valeur animée pour synchroniser l'indicateur (Paginator) avec le scroll
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // Détection de l'élément visible pour mettre à jour l'index actuel
  // J'utilise useRef ici pour éviter de recréer la fonction à chaque render
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Logique du bouton principal, scroll vers la suite ou redirection finale
  const scrollToNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Marque l'onboarding comme vu pour ne plus le montrer au prochain lancement
      await setOnboardingSeen();
      // replace pour éviter que l'utilisateur ne revienne sur l'onboarding via le bouton retour
      router.replace("/welcome"); 
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <FlatList
        data={ONBOARDING_SLIDES}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled // Force l'arrêt sur chaque slide
        bounces={false}
        keyExtractor={(item) => item.id}
        // Liaison du scroll avec scrollX pour les animations du Paginator
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } // Obligatoire à false car j'anime des propriétés de layout
        )}
        onViewableItemsChanged={viewableItemsChanged}
        // Je considère qu'une slide est changée dès qu'elle occupe 50% de l'écran
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        ref={slidesRef}
      />

      {/* Contrôles en bas de page (Pagination + Bouton Action) */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 pt-8">
        <View className="items-center mb-4">
           <Paginator data={ONBOARDING_SLIDES} scrollX={scrollX} />
        </View>

        <TouchableOpacity
          onPress={scrollToNext}
          activeOpacity={0.7}
          className="flex-row items-center justify-center h-16 rounded-2xl border-2 border-black"
          style={{ backgroundColor: theme.light.colors.background }}
        >
          <Text className="text-black font-bold text-lg mr-2 tracking-widest uppercase">
            {currentIndex === ONBOARDING_SLIDES.length - 1 ? "Entrer dans l'onde" : "Suivant"}
          </Text>
          
          {/* Changement d'icône dynamique selon la progression */}
          {currentIndex === ONBOARDING_SLIDES.length - 1 ? (
            <Check size={22} color="black" strokeWidth={3} />
          ) : (
            <ArrowRight size={22} color="black" strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}