import React from "react";
import { View, Text, Image, TouchableOpacity, useColorScheme } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Station } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface StationCardProps {
  item: Station;
  onPress: (item: Station) => void;
  onLongPress?: (item: Station) => void;
  onPlayPress?: (item: Station) => void;
  isPlaying?: boolean;
}

/**
 * PublicStationCard : Carte format grille (2 colonnes).
 * Affiche la pochette, le badge de live conditionnel et les métadonnées.
 */
export const PublicStationCard = ({ item, onPress, onLongPress, onPlayPress, isPlaying = false }: StationCardProps) => {
  const { t } = useTranslation();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      onLongPress={onLongPress ? () => onLongPress(item) : undefined}
      activeOpacity={0.8}
      className="w-[47%] mb-8"
    >
      <View className="relative">
        {/* Cover */}
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-44 rounded-[32px] mb-3"
          style={{ backgroundColor: colors.surface }}
        />

        {/* Badge de live */}
        {item.isLive && (
          <View
            className="absolute top-3 left-3 px-2 py-1 rounded-full border border-white/10"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <Text
              style={{ color: colors.live }}
              className="text-[8px] font-black uppercase tracking-tighter"
            >
              {t('home.publicStationCard.live')}
            </Text>
          </View>
        )}

        {/* Bouton play */}
        {onPlayPress ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onPlayPress(item); }}
            className="absolute bottom-5 right-5 p-2 rounded-full"
            style={{ backgroundColor: isPlaying ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.20)' }}
            hitSlop={8}
          >
            {isPlaying ? (
              <Pause size={14} color="#000" fill="#000" />
            ) : (
              <Play size={14} color="white" fill="white" />
            )}
          </TouchableOpacity>
        ) : (
          <View className="absolute bottom-5 right-5 bg-white/20 p-2 rounded-full">
            <Play size={14} color="white" fill="white" />
          </View>
        )}
      </View>

      {/* Catégorie */}
      <Text
        style={{ color: colors.muted }}
        className="text-[9px] uppercase font-black tracking-widest mb-1"
      >
        {item.category}
      </Text>

      {/* Titre de la station */}
      <Text
        style={{ color: colors.text }}
        className="font-bold text-base leading-5"
        numberOfLines={1}
      >
        {item.title}
      </Text>

      {/* Description */}
      <Text
        style={{ color: colors.muted }}
        className="text-[11px] mt-1 leading-4"
        numberOfLines={2}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};