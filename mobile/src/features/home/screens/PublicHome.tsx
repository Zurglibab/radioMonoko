import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useHome } from "@/hooks/home/useHome";
import { HomeHeader } from "@/features/home/components/public/HomeHeader";
import { FeaturedStation } from "@/features/home/components/public/FeaturedStation";
import { CommunitySection } from "@/features/home/components/public/CommunitySection";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

/**
 * PublicHome : Écran d'accueil pour les utilisateurs non connectés.
 * Offre un aperçu du catalogue et encourage l'inscription par des CTA subtils.
 */
export default function PublicHome() {
  const { t } = useTranslation();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
        
  const colors = isDark ? theme.dark.colors : theme.light.colors;
  const { stations } = useHome();
  const router = useRouter();

  /**
   * Action restreinte :
   * Affiche une alerte pour inviter l'utilisateur à créer un compte.
   */
  const promptLogin = (action: string) => {
    Alert.alert(
      t('home.publicHome.joinCommunityTitle'),
      t('home.publicHome.joinCommunityMessage', { action }),
      [
        { text: t('home.publicHome.later'), style: "cancel" },
        {
          text: t('home.publicHome.register'),
          onPress: () => router.push("/(auth)/register"),
          style: "default"
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* EN-TÊTE : Logo et actions de bienvenue */}
        <HomeHeader />

        {/* À LA UNE : Mise en avant de la station phare du moment */}
        {stations.length > 0 && <FeaturedStation station={stations[0]} />}

        {/* EXPLORATION : Navigation par genres populaires */}
        <View className="mb-12">
          <Text style={{ color: colors.text }} className="px-6 text-lg font-bold mb-5 italic tracking-tight">
            {t('home.publicHome.popularGenres')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {[
              t('home.publicHome.genrePodcast'),
              t('home.publicHome.genreJournalism'),
              t('home.publicHome.genreMusic'),
              t('home.publicHome.genreCulture'),
              t('home.publicHome.genreHistory'),
            ].map((genre, i) => (
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.7}
                style={{ 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border 
                }}
                className="mr-3 px-6 py-4 rounded-3xl border shadow-sm"
              >
                <Text style={{ color: colors.text }} className="font-bold text-xs">
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* COMMUNAUTÉ : Section interactive invitant à l'échange */}
        <CommunitySection onPrompt={promptLogin} />

        {/* CATALOGUE : Grille de stations disponibles en libre accès */}
        <View className="px-6 pb-20">
          <View className="flex-row justify-between items-center mb-8">
            <Text
              style={{ color: colors.text }}
              className="text-xl font-bold italic tracking-tight"
            >
              {t('home.publicHome.allStations')}
            </Text>
            <TrendingUp size={20} color={colors.muted} />
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {/* On exclut la première station (déjà en Featured) */}
            {stations.slice(1, 5).map((item) => (
              <PublicStationCard 
                key={item.id} 
                item={item} 
                onPress={() => {/* Navigation vers le lecteur */}} 
              />
            ))}
          </View>

          {/* CTA FINAL : Incitation à l'inscription pour l'accès complet */}
          <TouchableOpacity
            onPress={() => promptLogin(t('home.publicHome.actionAccessCatalog'))}
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface
            }}
            className="w-full py-6 rounded-[32px] items-center mt-4 border-2 border-dashed shadow-sm"
          >
            <Text
              style={{ color: colors.muted }}
              className="font-bold uppercase text-[10px] tracking-widest text-center px-4"
            >
              {t('home.publicHome.unlockContent')}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}