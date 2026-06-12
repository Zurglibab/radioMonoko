import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { PlayCircle, PauseCircle, Plus } from "lucide-react-native";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";
import { useThemeColors, useIsDarkMode } from "@/utils/useThemeColors";
import { useTranslation } from "react-i18next";

export const MediaSuggestion = ({ item }: { item: Station }) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  const { currentTrack, isPlaying, liveSongTitle, playTrack, togglePlay } = usePlayer();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const isCurrentMedia = currentTrack?.id === item.id;

  const handlePress = () => {
    if (isCurrentMedia) {
      togglePlay();
    } else {
      playTrack(item); 
    }
  };

  return (
    <View className="mr-5 w-40">
      <View
        className="w-40 h-40 rounded-[32px] overflow-hidden relative border shadow-sm" 
        style={{ 
          borderColor: isCurrentMedia ? colors.primary : colors.border, 
          backgroundColor: colors.surface 
        }}
      >
        <Image 
          source={{ uri: item.imageUrl }}
          className={`w-full h-full ${isCurrentMedia ? 'opacity-40' : 'opacity-90'}`} 
          style={{ backgroundColor: colors.surface }}
        />
        
        <TouchableOpacity
          className="absolute inset-0 items-center justify-center"
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {isCurrentMedia && isPlaying ? (
            <PauseCircle size={52} color={colors.primary} fill={isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.2)"} />
          ) : (
            <PlayCircle 
              size={52} 
              color={isCurrentMedia ? colors.primary : (isDark ? "white" : colors.text)} 
              fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)"} 
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="absolute top-3 right-3 p-2 rounded-full border"
          style={{ 
            backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
            borderColor: colors.border
          }}
          onPress={() => setIsSheetVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View className="mt-3 px-1">
        <Text 
          style={{ color: isCurrentMedia ? colors.primary : colors.text }} 
          className="font-black text-[13px] tracking-tight" 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text 
          style={{ color: colors.muted }} 
          className="text-[10px] font-black uppercase tracking-tighter"
          numberOfLines={1}
        >
          {isCurrentMedia && liveSongTitle ? t('home.mediaSuggestion.live', { song: liveSongTitle }) : item.artist}
        </Text>
      </View>

      {isSheetVisible && (
        <MediaActionSheet
          isVisible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
          station={item}
        />
      )}
    </View>
  );
};