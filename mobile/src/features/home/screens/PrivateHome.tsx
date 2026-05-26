import React from "react";
import { ScrollView, View, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Users, ChevronRight } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useBrands } from "@/hooks/home/useBrands";
import { useCommunity } from "@/hooks/community/useCommunity";
import { StatCard } from "@/features/home/components/private/StatCard";
import { ActivityCard } from "@/features/home/components/private/ActivityCard";
import { MediaSuggestion } from "@/features/home/components/private/MediaSuggestion";
import { PrivateHeader } from "@/features/home/components/private/PrivateHeader";
import { LibraryQuickNav } from "@/features/home/components/private/LibraryQuickNav";
import { useAuthContext } from "@/context/AuthContext";

/**
 * PrivateHome : Tableau de bord central et hub social de l'utilisateur connecté.
 * Fusionne les données synchrones locales (statistiques de collection de la bibliothèque) 
 * et les flux asynchrones distants (carrousel de stations API et fil d'actualité réseau).
 */
export default function PrivateHome({ user }: { user: User }) {
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
  
  // Données synchrones : Statistiques de la bibliothèque locale (nombre de médias par status)
  const { statusItems } = useLibrary();
  const { feed } = useCommunity();

  /**
   * Données distantes : Carrousel de stations en direct depuis l'API.
   * Gère les états de chargement et d'erreur pour une expérience fluide même en cas de problème serveur.
   * Affiche les 5 premières stations pour respecter la demande de concision du carrousel.
   */
  const { brands, isLoading: isBrandsLoading, error: brandsError } = useBrands();

  // Statistique clé : Nombre de médias "Écoutés" (status "finished") dans la bibliothèque de l'utilisateur
  const finishedCount = statusItems.find(s => s.slug === 'finished')?.count || 0;

  /**
   * Tableau de bord personnalisé : Affiche les statistiques clés de la bibliothèque de l'utilisateur
   */
  const stats = [
    { 
      id: "1", 
      label: "Écoutés", 
      value: finishedCount.toString(), 
      icon: <Clock size={18} color={colors.text} /> 
    },
    { 
      id: "2", 
      label: "Abonnements", 
      value: "42",
      icon: <Users size={18} color={colors.text} /> 
    },
  ];

  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: colors.background }}
    >
      {/* En-tête de l'application (Profil utilisateur et accès aux notifications) */}
      <PrivateHeader user={user} />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        
        {/* Statistiques du tableau de bord */}
        <View className="flex-row gap-x-4 px-6 mb-10">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </View>

        {/* Navigation rapide */}
        <LibraryQuickNav />

        {/* Suggestions du jour */}
        <View className="mb-10">
          <Text 
            style={{ color: colors.text }} 
            className="text-xl font-black px-6 mb-6 italic tracking-tighter"
          >
            Découvertes du jour
          </Text>

          {isBrandsLoading ? (
            /* Spinner discret */
            <View className="py-6 justify-center items-center">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : brandsError ? (
            /* Fallback qui évite le plantage visuel si le serveur local/docker est éteint */
            <View className="px-6 py-2">
              <Text className="text-red-500 text-xs font-bold">
                Impossible de charger les stations en direct.
              </Text>
            </View>
          ) : (
            /* Affichage du carrousel */
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="px-6"
              contentContainerStyle={{ paddingRight: 40 }}
            >
              {brands.map((station) => (
                <MediaSuggestion key={station.id} item={station} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Fill d'activité */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-end mb-6">
            <Text 
              style={{ color: colors.text }} 
              className="text-xl font-black italic tracking-tighter"
            >
              Activités du réseau
            </Text>
          </View>
          
          {/* Cartes chronologiques inverses des actions des amis (Notes, avis) */}
          {feed.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
          
          {/* Navigation ou pagination du flux global */}
          <TouchableOpacity 
            className="flex-row items-center justify-center p-6 rounded-[32px] mt-4 border-2 border-dashed"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: 0.8
            }}
            activeOpacity={0.7}
          >
            <Text 
              style={{ color: colors.muted }} 
              className="font-black mr-2 uppercase text-[10px] tracking-[2px]"
            >
              Voir tout le flux
            </Text>
            <ChevronRight size={14} color={colors.muted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}