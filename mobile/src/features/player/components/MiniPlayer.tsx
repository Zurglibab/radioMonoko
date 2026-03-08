import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { Play, Pause, X } from "lucide-react-native";
import { usePlayer } from "@/context/PlayerContext";
import { theme } from "@/constants/theme";

/**
 * MiniPlayer : Lecteur persistant flottant.
 * Il s'affiche dès qu'un média est chargé dans le PlayerContext.
 * Positionné juste au-dessus de la TabBar pour une accessibilité maximale.
 */
export const MiniPlayer = () => {
  // Je m'abonne aux changements du contexte global pour réagir en temps réel
  const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayer();

  // Si rien n'est joué, je ne rend absolument rien (évite les bugs de layout)
  if (!currentTrack) return null;

  return (
    <Pressable 
      // Positionnement flottant au-dessus de la barre d'onglets
      className="absolute bottom-[95px] left-2 right-2 h-16 flex-row items-center px-3 rounded-2xl border overflow-hidden shadow-2xl"
      style={{ 
        backgroundColor: "#121212", 
        borderColor: "#222",
        elevation: 10
      }}
    >
      {/* Rappel visuel de la miniature du média */}
      <Image 
        source={{ uri: currentTrack.image }} 
        className="w-10 h-10 rounded-lg mr-3" 
      />
      
      {/* Titre et Artiste */}
      <View className="flex-1">
        <Text 
          className="text-white text-sm font-bold" 
          numberOfLines={1}
        >
          {currentTrack.title}
        </Text>
        <Text className="text-gray-400 text-xs" numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Actions rapides */}
      <View className="flex-row items-center gap-x-4 px-2">
        {/* Play/pause */}
        <TouchableOpacity 
          onPress={togglePlay} 
          className="w-10 h-10 items-center justify-center rounded-full bg-white"
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={20} color="black" fill="black" />
          ) : (
            <Play size={20} color="black" fill="black" className="ml-1" />
          )}
        </TouchableOpacity>

        {/* Fermer, pour vider le track */}
        <TouchableOpacity 
          onPress={() => playTrack(null as any)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {/* Barre de progression */}
      {/* Fond de la barre */}
      <View className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full" />
      {/* Progression réelle, statique à 35% ici */}
      <View className="absolute bottom-0 left-0 h-[2px] bg-white w-[35%]" />
    </Pressable>
  );
};