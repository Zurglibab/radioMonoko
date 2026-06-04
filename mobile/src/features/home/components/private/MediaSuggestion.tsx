import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, useColorScheme } from "react-native";
import { PlayCircle, PauseCircle, Plus } from "lucide-react-native";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { theme } from "@/constants/theme";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";

/**
 * MediaSuggestion : Carte de contenu interactive (Pochette carrée).
 * Gère la lecture audio et l'accès aux options de bibliothèque.
 * @param item - Données de la station ou du podcast.
 */
export const MediaSuggestion = ({ item }: { item: Station }) => {
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

  // Accès aux fonctions de contrôle du lecteur audio et aux états de lecture
  const { currentTrack, isPlaying, liveSongTitle, playTrack, togglePlay } = usePlayer();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  // Déterminer si ce média précis est celui chargé dans le lecteur
  const isCurrentMedia = currentTrack?.id === item.id;

  /**
   * Gestion de la pression sur la carte : Si le média est déjà en cours de lecture, on bascule entre play/pause.
   * Sinon, on lance la lecture de ce média. Cela permet une interaction intuitive : un tap rapide pour jouer/mettre en pause,
   * et un changement de média fluide sans nécessiter d'étapes supplémentaires.
   */
  const handlePress = () => {
    if (isCurrentMedia) {
      togglePlay();
    } else {
      playTrack(item); 
    }
  };

  return (
    <View className="mr-5 w-40">
      {/* Cover */}
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
        
        {/* Overlay de lecture (centrale) */}
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

        {/* Bouton options (+) */}
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

      {/* Titre et Artiste */}
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
          {isCurrentMedia && liveSongTitle ? `Direct : ${liveSongTitle}` : item.artist}
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