import React from "react";
import { View, Image, Text } from "react-native";
import { ListMusic } from "lucide-react-native";
import { MediaItem } from "@/types/library";

/**
 * PlaylistCover : Générateur visuel de pochette de playlist.
 * Adapte son rendu selon le contenu :
 * 0 item : Placeholder avec icône.
 * 1-3 items : Affiche la pochette du premier élément.
 * 4+ items : Crée un quadrillage (grid) des 4 premières pochettes.
 * * @param items : Liste des médias contenus dans la playlist.
 * @param size : Dimension du composant.
 */
export const PlaylistCover = ({ items, size = 64 }: { items: MediaItem[], size?: number }) => {
  
  // Cas 1 : Playlist vide
  if (items.length === 0) {
    return (
      <View 
        style={{ width: size, height: size }} 
        className="bg-zinc-800 rounded-xl items-center justify-center"
      >
        {/* L'icône s'adapte proportionnellement à la taille demandée */}
        <ListMusic size={size / 2} color="#444" />
      </View>
    );
  }

  // Cas 2 : Playlist partielle (moins de 4 images)
  // On affiche la première image en plein format pour éviter les vides dans la grille.
  if (items.length < 4) {
    return (
      <Image 
        source={{ uri: items[0].imageUrl }} 
        style={{ width: size, height: size }} 
        className="rounded-xl bg-zinc-800" 
      />
    );
  }

  // Cas 3 : Quadrillage pour une playliste complète de plus de 4 track
  return (
    <View 
      style={{ width: size, height: size }} 
      className="flex-row flex-wrap rounded-xl overflow-hidden bg-zinc-900"
    >
      {items.slice(0, 4).map((item, index) => (
        <Image 
          key={index}
          source={{ uri: item.imageUrl }} 
          // Chaque image occupe exactement un quart de la surface
          style={{ width: size / 2, height: size / 2 }}
          className="border-[0.5px] border-black/10" // Légère séparation interne
        />
      ))}
    </View>
  );
};