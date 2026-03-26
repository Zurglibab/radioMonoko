import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Users, ChevronRight } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useLibrary } from "@/hooks/home/useLibrary";
import { StatCard } from "@/features/home/components/private/StatCard";
import { ActivityCard } from "@/features/home/components/private/ActivityCard";
import { MediaSuggestion } from "@/features/home/components/private/MediaSuggestion";
import { PrivateHeader } from "@/features/home/components/private/PrivateHeader";
import { LibraryQuickNav } from "@/features/home/components/private/LibraryQuickNav";

export default function PrivateHome({ user }: { user: User }) {
  const { statusItems, favorites } = useLibrary();

  const finishedCount = statusItems.find(s => s.slug === 'finished')?.count || 0;

  const stats = [
    { 
      id: "1", 
      label: "Écoutés", 
      value: finishedCount.toString(), 
      icon: <Clock size={18} color="white" /> 
    },
    { 
      id: "2", 
      label: "Abonnements", 
      value: "42",
      icon: <Users size={18} color="white" /> 
    },
  ];

  const activities = Array(3).fill({
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
      <PrivateHeader user={user} />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        
        {/* Dashboard Statistique (Barème 2.2.2) */}
        <View className="flex-row gap-x-4 px-6 mb-10">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </View>

        {/* Navigation Rapide Bibliothèque */}
        <LibraryQuickNav />

        {/* Suggestions de contenu (Type Station) */}
        <View className="mb-10">
          <Text 
            style={{ color: theme.dark.colors.text }} 
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
            {/* On utilise nos vrais favoris ou des stations typées Station */}
            {favorites.map((station) => (
              <MediaSuggestion key={station.id} item={station} />
            ))}
          </ScrollView>
        </View>

        {/* Fil d'actualité (Barème 2.2.4) */}
        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-end mb-6">
            <Text 
              style={{ color: theme.dark.colors.text }} 
              className="text-xl font-black italic tracking-tighter"
            >
              Activités du réseau
            </Text>
          </View>
          
          {activities.map((act, idx) => (
            <ActivityCard key={idx} activity={act} />
          ))}
          
          <TouchableOpacity 
            className="flex-row items-center justify-center p-6 rounded-[32px] mt-4 border-2 border-dashed"
            style={{ 
              borderColor: theme.dark.colors.surface,
              backgroundColor: 'rgba(255,255,255,0.02)' 
            }}
            activeOpacity={0.7}
          >
            <Text 
              style={{ color: theme.dark.colors.muted }} 
              className="font-black mr-2 uppercase text-[10px] tracking-[2px]"
            >
              Voir tout le flux
            </Text>
            <ChevronRight size={14} color={theme.dark.colors.muted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}