import React from "react";
import { ScrollView, View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Users, ChevronRight } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useCommunity } from "@/hooks/community/useCommunity";
import { StatCard } from "@/features/home/components/private/StatCard";
import { ActivityCard } from "@/features/home/components/private/ActivityCard";
import { MediaSuggestion } from "@/features/home/components/private/MediaSuggestion";
import { PrivateHeader } from "@/features/home/components/private/PrivateHeader";
import { LibraryQuickNav } from "@/features/home/components/private/LibraryQuickNav";
import { useAuthContext } from "@/context/AuthContext";

/**
 * PrivateHome : Tableau de bord principal pour les utilisateurs authentifiés.
 * Affiche les statistiques personnelles, la navigation rapide vers la bibliothèque,
 * les suggestions quotidiennes et le flux social du réseau.
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
  const { statusItems, favorites } = useLibrary();
  const { feed, isLoading } = useCommunity();

  // Récupération dynamique du compteur de médias terminés
  const finishedCount = statusItems.find(s => s.slug === 'finished')?.count || 0;

  /**
   * Configuration des statistiques du Dashboard.
   * Les icônes s'adaptent dynamiquement à la couleur textuelle du thème.
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
      {/* Header personnalisé gérant le profil et les notifications */}
      <PrivateHeader user={user} />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        
        {/* SECTION 1 : DASHBOARD STATISTIQUE
            Cartes horizontales pour un aperçu rapide de l'activité.
        */}
        <View className="flex-row gap-x-4 px-6 mb-10">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </View>

        {/* SECTION 2 : NAVIGATION RAPIDE
            Accès direct aux sections clés de la bibliothèque.
        */}
        <LibraryQuickNav />

        {/* SECTION 3 : SUGGESTIONS DU JOUR
            Carrousel horizontal de stations basées sur les préférences.
        */}
        <View className="mb-10">
          <Text 
            style={{ color: colors.text }} 
            className="text-xl font-black px-6 mb-6 italic tracking-tighter"
          >
            Découvertes du jour
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-6"
            contentContainerStyle={{ paddingRight: 40 }}
          >
            {favorites.map((station) => (
              <MediaSuggestion key={station.id} item={station} />
            ))}
          </ScrollView>
        </View>

        {/* SECTION 4 : FLUX SOCIAL
            Affiche l'activité récente des membres du réseau.
        */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-end mb-6">
            <Text 
              style={{ color: colors.text }} 
              className="text-xl font-black italic tracking-tighter"
            >
              Activités du réseau
            </Text>
          </View>
          
          {feed.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
          
          {/* BOUTON D'EXPANSION DU FLUX
              Design "Outline" utilisant les couleurs de surface pour la discrétion.
          */}
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