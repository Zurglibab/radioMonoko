import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useHome } from "@/hooks/home/useHome";
import { HomeHeader } from "@/features/home/components/public/HomeHeader";
import { FeaturedStation } from "@/features/home/components/public/FeaturedStation";
import { CommunitySection } from "@/features/home/components/public/CommunitySection";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";

/**
 * PublicHome : Écran d'accueil pour les utilisateurs non connectés.
 * Mixte entre contenu en libre accès et incitations à l'inscription.
 */
export default function PublicHome() {
  const { stations } = useHome();
  const router = useRouter();

  /**
   * Fonction de rappel pour les actions restreintes.
   * Affiche une alerte native stylée pour rediriger vers l'inscription.
   */
  const promptLogin = (action: string) => {
    Alert.alert(
      "Rejoignez la communauté",
      `La consultation est libre, mais vous devez être connecté pour ${action}.`,
      [
        { text: "Plus tard", style: "cancel" },
        { 
          text: "S'inscrire", 
          onPress: () => router.push("/(auth)/register"),
          style: "default" 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* En-tête personnalisé */}
        <HomeHeader />

        {/* Station à la une */}
        {stations.length > 0 && <FeaturedStation station={stations[0]} />}

        {/* Navigation entre les genres */}
        <View className="mb-12">
          <Text className="px-6 text-white text-lg font-bold mb-5 italic tracking-tight">
            Genres populaires
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {['Podcast', 'Journalisme', 'Musique', 'Culture', 'Histoire'].map((genre, i) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.7}
                className="mr-3 px-6 py-4 rounded-3xl border" 
                style={{ 
                  backgroundColor: theme.dark.colors.surface, 
                  borderColor: theme.dark.colors.border 
                }}
              >
                <Text style={{ color: theme.dark.colors.text }} className="font-bold text-xs">
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Section de la communauté */}
        <CommunitySection onPrompt={promptLogin} />

        {/* Grille de stations publiques */}
        <View className="px-6 pb-20">
          <View className="flex-row justify-between items-center mb-8">
            <Text 
              style={{ color: theme.dark.colors.text }} 
              className="text-xl font-bold italic tracking-tight"
            >
              Toutes les ondes
            </Text>
            <TrendingUp size={20} color={theme.dark.colors.muted} />
          </View>
          
          {/* Exclu la première station déjà affichée en 'Featured' */}
          <View className="flex-row flex-wrap justify-between">
            {stations.slice(1, 5).map((item) => (
              <PublicStationCard 
                key={item.id} 
                item={item} 
                onPress={() => {/* Navigation libre vers le player */}} 
              />
            ))}
          </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity 
            className="w-full py-6 rounded-[32px] items-center mt-4 border-2 border-dashed"
            style={{ borderColor: theme.dark.colors.border }}
            onPress={() => promptLogin("accéder à l'intégralité du catalogue")}
          >
            <Text 
              style={{ color: theme.dark.colors.muted }} 
              className="font-bold uppercase text-[10px] tracking-widest text-center px-4"
            >
              Inscrivez-vous pour débloquer tout le contenu
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}