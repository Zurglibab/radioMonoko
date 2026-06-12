import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlayCircle } from "lucide-react-native";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";
import { useThemeColors } from "@/utils/useThemeColors";
import { useTranslation } from "react-i18next";

/**
 * FeaturedStation : Composant de mise en avant (Hero Card).
 * Utilisé pour présenter la station phare ou le contenu "chaud" du moment.
 * @param station : Objet Station complet issu du typage centralisé.
 */
export const FeaturedStation = ({ station }: { station: Station }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { playTrack } = usePlayer();
  
  return (
    <View className="px-6 mb-12">
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => playTrack(station)}
        className="relative h-80 rounded-[44px] overflow-hidden border"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        {/* Image de fond */}
        <Image 
          source={{ uri: station.imageUrl }} 
          className="absolute inset-0 w-full h-full" 
          resizeMode="cover"
        />

        {/* Overlay */}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.9)']} 
          className="absolute inset-0 p-8 justify-end"
        >
          {/* Badge Live conditionnel et catégorie */}
          <View className="flex-row items-center mb-4">
            {station.isLive && (
              <View 
                style={{ backgroundColor: colors.live }} 
                className="px-3 py-1 rounded-full shadow-lg"
              >
                <Text className="text-white text-[10px] font-black italic">{t('home.featuredStation.live')}</Text>
              </View>
            )}
            <Text 
              style={{ color: colors.muted }}
              className="text-[10px] ml-3 font-bold uppercase tracking-[2px]"
            >
              {station.category}
            </Text>
          </View>

          <Text 
            style={{ color: colors.text }}
            className="text-4xl font-black mb-4 leading-[38px] tracking-tighter italic"
          >
            {station.title}
          </Text>

          {/* Preuve sociale avec effet de transparence */}
          <View className="flex-row items-center bg-white/10 self-start px-4 py-2 rounded-2xl border border-white/5">
            <PlayCircle size={18} color="white" fill="rgba(255,255,255,0.2)" />
            <Text className="text-white ml-3 font-bold text-xs">
              {t('home.featuredStation.listenersCount', { count: station.listenersCount || 0 })}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};