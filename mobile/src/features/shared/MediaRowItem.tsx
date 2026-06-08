import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Music2, Mic2 } from "lucide-react-native";
import { Station } from "@/types/content";

/**
 * MediaRowItem : Composant réutilisable pour afficher une ligne d'œuvre (radio ou podcast) dans les listes.
 * Affiche la pochette, le titre, l'artiste (ou description) et gère l'interaction de base (onPress).
 * Utilisé dans les listes de favoris, playlists, statuts, etc. pour assurer une présentation cohérente.
 */
interface MediaRowItemProps {
  item: Station;
  index: number;
  colors: any;
  onPress: () => void;
  subtitle?: string;
  trailing?: React.ReactNode;
}

/**
 * MediaRowItem : Affiche une ligne d'œuvre avec image, titre, artiste/description et interaction.
 * Gère les cas où l'image est absente en affichant une icône par défaut (différenciée pour radio/podcast).
 * Permet une personnalisation du sous-titre et d'un élément trailing (ex: bouton d'action).
 * @param param0 
 * @returns 
 */
export const MediaRowItem = ({ item, index, colors, onPress, subtitle, trailing }: MediaRowItemProps) => {
  const isPodcast = item.type === "podcast";

  return (
    <TouchableOpacity 
      key={`${item.id}-${index}`} 
      className="flex-row items-center mb-6" 
      onPress={onPress}
      activeOpacity={0.6}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ borderColor: colors.border, borderWidth: 1 }} className="w-14 h-14 rounded-2xl mr-4" />
      ) : (
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="w-14 h-14 rounded-2xl mr-4 items-center justify-center border">
          {isPodcast ? <Mic2 size={20} color={colors.muted} /> : <Music2 size={20} color={colors.primary} />}
        </View>
      )}
      <View className="flex-1">
        <View className="flex-row items-center mb-0.5">
          <Text style={{ color: colors.text }} className="font-bold text-base flex-1" numberOfLines={1}>{item.title}</Text>
        </View>
        <Text style={{ color: colors.muted }} className="text-xs font-medium">
          {subtitle || item.artist}
        </Text>
      </View>
      {trailing}
    </TouchableOpacity>
  );
};