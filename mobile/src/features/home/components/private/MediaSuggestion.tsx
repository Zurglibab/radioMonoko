import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { PlayCircle, PauseCircle, Plus } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { usePlayer } from "@/context/PlayerContext";

/**
 * MediaSuggestion : Carte de contenu multimédia (Podcast, Station, Titre).
 * Intègre une logique de synchronisation avec le lecteur global (PlayerContext).
 * @param item : Les données du média (id, title, artist, image).
 */
export const MediaSuggestion = ({ item }: any) => {
  // Je récupère l'état global du lecteur pour synchroniser l'affichage
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  // Détermine si cette carte précise est celle actuellement chargée dans le lecteur
  const isCurrentMedia = currentTrack?.id === item.id;

  /**
   * Gère l'interaction de lecture.
   * Soit je bascule l'état (Play/Pause) du média actuel, 
   * soit j'injecte un nouveau média dans le flux global.
   */
  const handlePress = () => {
    if (isCurrentMedia) {
      togglePlay();
    } else {
      // Chargement des métadonnées dans le lecteur global
      playTrack({
        id: item.id,
        title: item.title,
        artist: item.artist,
        image: item.image,
      });
    }
  };

  return (
    <View className="mr-4 w-40">
      {/* Affichage de la pochette du média */}
      <View 
        className="w-40 h-40 rounded-3xl overflow-hidden relative border" 
        style={{ 
          // Mise en évidence visuelle si le titre est actif
          borderColor: isCurrentMedia ? theme.dark.colors.primary : theme.dark.colors.border, 
          backgroundColor: theme.dark.colors.surface 
        }}
      >
        <Image 
          source={{ uri: item.image }} 
          // Je réduis l'opacité si le média joue pour faire ressortir l'icône centrale
          className={`w-full h-full ${isCurrentMedia ? 'opacity-40' : 'opacity-60'}`} 
        />
        
        {/* Bouton de lecture centré */}
        <TouchableOpacity 
          className="absolute inset-0 items-center justify-center"
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {isCurrentMedia && isPlaying ? (
            <PauseCircle size={44} color={theme.dark.colors.primary} />
          ) : (
            <PlayCircle size={44} color={isCurrentMedia ? theme.dark.colors.primary : "white"} />
          )}
        </TouchableOpacity>

        {/* Bouton "Ajouter aux favoris" */}
        <TouchableOpacity 
          className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-white/10"
          onPress={() => console.log("Média ajouté aux favoris")}
          activeOpacity={0.8}
        >
          <Plus size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Titre du média */}
      <Text 
        style={{ color: isCurrentMedia ? theme.dark.colors.primary : theme.dark.colors.text }} 
        className="font-bold mt-3 text-sm" 
        numberOfLines={1} // Évite de casser le layout si le titre est trop long
      >
        {item.title}
      </Text>
      <Text 
        style={{ color: theme.dark.colors.muted }} 
        className="text-xs"
        numberOfLines={1}
      >
        {item.artist}
      </Text>
    </View>
  );
};