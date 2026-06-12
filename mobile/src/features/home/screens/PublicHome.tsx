import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePlayer } from "@/context/PlayerContext";
import { useHome } from "@/hooks/home/useHome";
import { HomeHeader } from "@/features/home/components/public/HomeHeader";
import { FeaturedStation } from "@/features/home/components/public/FeaturedStation";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";
import { useThemeColors } from "@/utils/useThemeColors";
import { usePromptLogin } from "@/features/shared/usePromptLogin";
import { useTranslation } from "react-i18next";

/**
 * PublicHome : Écran d'accueil pour les utilisateurs non connectés.
 * Offre un aperçu du catalogue et encourage l'inscription par des CTA subtils.
 */
export default function PublicHome() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { stations } = useHome();
  const router = useRouter();
  const { playTrack } = usePlayer();
  const promptLogin = usePromptLogin();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Logo et actions de bienvenue */}
      <HomeHeader />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Mise en avant de la station phare du moment */}
        {stations.length > 0 && <FeaturedStation station={stations[0]} />}

        {/* Navigation par genres populaires */}
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
                onPress={() => router.push({ pathname: "/(tabs)/search", params: { q: genre } })}
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

        {/* Grille de stations disponibles en libre accès */}
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
            {/* On exclut la première station */}
            {stations.slice(1, 5).map((item) => (
              <PublicStationCard
                key={item.id}
                item={item}
                onPress={(station) => playTrack(station)}
              />
            ))}
          </View>

          {/* Incitation à l'inscription pour l'accès complet */}
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