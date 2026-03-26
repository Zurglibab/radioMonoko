import React, { useState } from "react";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { PlayCircle, PauseCircle, Plus } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";

/**
 * MediaSuggestion : Carte de contenu interactive.
 * Gère la lecture audio via le PlayerContext et l'ouverture des options 
 * de bibliothèque via une ActionSheet (BottomSheet).
 * * @param item - Données de la station (id, title, artist, imageUrl).
 */
export const MediaSuggestion = ({ item }: { item: Station }) => {
  // Accès au contrôleur de lecture global
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  
  // État local pour le menu d'actions (Favoris, playlists, etc.)
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  // Vérifie si cette carte correspond au média en cours de lecture
  const isCurrentMedia = currentTrack?.id === item.id;

  /**
   * handlePress : Logique de lecture intelligente.
   * Bascule entre Play/Pause ou charge un nouveau flux.
   */
  const handlePress = () => {
    if (isCurrentMedia) {
      togglePlay();
    } else {
      // On injecte l'objet station complet dans le lecteur
      playTrack(item); 
    }
  };

  return (
    <View className="mr-4 w-40">
      {/* Contenuer visuel */}
      <View 
        className="w-40 h-40 rounded-[32px] overflow-hidden relative border" 
        style={{ 
          // Feedback visuel : bordure colorée si le titre est actif
          borderColor: isCurrentMedia ? theme.dark.colors.primary : "transparent", 
          backgroundColor: theme.dark.colors.surface 
        }}
      >
        <Image 
          source={{ uri: item.imageUrl }}
          className={`w-full h-full ${isCurrentMedia ? 'opacity-40' : 'opacity-80'}`} 
        />
        
        {/* Zone de lecture principale */}
        <TouchableOpacity 
          className="absolute inset-0 items-center justify-center"
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {isCurrentMedia && isPlaying ? (
            <PauseCircle size={48} color={theme.dark.colors.primary} fill="rgba(0,0,0,0.5)" />
          ) : (
            <PlayCircle 
              size={48} 
              color={isCurrentMedia ? theme.dark.colors.primary : "white"} 
              fill="rgba(0,0,0,0.3)" 
            />
          )}
        </TouchableOpacity>

        {/* Action secondaire : Bouton "+" pour ouvrir les options */}
        <TouchableOpacity 
          className="absolute top-3 right-3 p-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10"
          onPress={() => setIsSheetVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Les métadonnées : Titre et Artiste/Catégorie */}
      <View>
        <Text 
          style={{ color: isCurrentMedia ? theme.dark.colors.primary : theme.dark.colors.text }} 
          className="font-bold mt-3 text-sm tracking-tight" 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text 
          style={{ color: theme.dark.colors.muted }} 
          className="text-[11px] font-medium"
          numberOfLines={1}
        >
          {item.artist}
        </Text>
      </View>

      {/* Componsant modal : Menu d'actions contextuelles */}
      <MediaActionSheet 
        isVisible={isSheetVisible} 
        onClose={() => setIsSheetVisible(false)} 
        station={item}
      />
    </View>
  );
};