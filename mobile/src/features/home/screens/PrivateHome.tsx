import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Users, ChevronRight } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { StatCard } from "@/features/home/components/private/StatCard";
import { ActivityCard } from "@/features/home/components/private/ActivityCard";
import { MediaSuggestion } from "@/features/home/components/private/MediaSuggestion";
import { PrivateHeader } from "@/features/home/components/private/PrivateHeader";
import { LibraryQuickNav } from "@/features/home/components/private/LibraryQuickNav";

/**
 * PrivateHome : Écran d'accueil principal après connexion.
 * Orchestre les différents sous-composants pour offrir une vue d'ensemble 
 * personnalisée de l'activité de l'utilisateur et des nouveautés.
 */
export default function PrivateHome({ user }: { user: User }) {
  // Configuration des statistiques rapides du tableau de bord
  const stats = [
    { id: "1", label: "Écoutés", value: "128", icon: <Clock size={18} color="white" /> },
    { id: "2", label: "Abonnements", value: "42", icon: <Users size={18} color="white" /> },
  ];

  // Simulation de données pour le flux d'activité
  const activities = Array(5).fill({
    user: "Marc",
    media: "Jazz Night",
    rating: 4,
    comment: "La sélection Bebop était parfaite. Un vrai régal pour coder !",
    likes: 24,
    commentsCount: 8
  });

  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: theme.dark.colors.background }}
    >
      {/* En-tête personnalisé avec infos utilisateur */}
      <PrivateHeader user={user} />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        
        {/* Dashboard des statistiques de l'utilisateur */}
        <View className="flex-row gap-x-4 px-6 mb-10">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </View>

        {/* Filtres de la bibliothèque */}
        <LibraryQuickNav />

        {/* Suggestions du contenu et d'écoute */}
        <View className="mb-10">
          <Text 
            style={{ color: theme.dark.colors.text }} 
            className="text-lg font-bold px-6 mb-4 tracking-tight"
          >
            Découvertes du jour
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-6"
            contentContainerStyle={{ paddingRight: 40 }}
          >
            <MediaSuggestion item={{ id: '1', title: 'Deep Focus', artist: 'Radio Zen', image: 'https://picsum.photos/400/400' }} />
            <MediaSuggestion item={{ id: '2', title: 'Tech Talk', artist: 'Podcast FR', image: 'https://picsum.photos/401/401' }} />
            <MediaSuggestion item={{ id: '3', title: 'Jazz Night', artist: 'Classic FM', image: 'https://picsum.photos/402/402' }} />
          </ScrollView>
        </View>

        {/* Section du flux d'activités récentes */}
        <View className="px-6 mb-4">
          <Text 
            style={{ color: theme.dark.colors.text }} 
            className="text-lg font-bold mb-4 tracking-tight"
          >
            Activités récentes
          </Text>
          
          {/* Liste verticale des activités des amis */}
          {activities.map((act, idx) => (
            <ActivityCard key={idx} activity={act} />
          ))}
          
          {/* Bouton d'action secondaire pour étendre le flux */}
          <TouchableOpacity 
            className="flex-row items-center justify-center p-5 rounded-3xl mt-2 border-2 border-dashed"
            style={{ borderColor: theme.dark.colors.border }}
            activeOpacity={0.6}
          >
            <Text 
              style={{ color: theme.dark.colors.muted }} 
              className="font-bold mr-2 uppercase text-xs tracking-widest"
            >
              Voir toutes les activités
            </Text>
            <ChevronRight size={16} color={theme.dark.colors.muted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}