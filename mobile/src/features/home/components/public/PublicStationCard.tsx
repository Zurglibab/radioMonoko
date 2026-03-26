import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Play } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Station } from "@/types/content";

/**
 * Interface StationCardProps
 * On passe maintenant l'objet Station complet et on typage le callback
 * pour renvoyer l'item au parent (pratique pour le PlayerContext).
 */
interface StationCardProps {
  item: Station;
  onPress: (item: Station) => void; 
}

/**
 * PublicStationCard : Carte format grille (2 colonnes).
 * Affiche la pochette, le badge de live conditionnel et les métadonnées.
 */
export const PublicStationCard = ({ item, onPress }: StationCardProps) => (
  <TouchableOpacity 
    onPress={() => onPress(item)}
    activeOpacity={0.8}
    className="w-[47%] mb-8"
  >
    <View className="relative">
      {/* Cover */}
      <Image 
        source={{ uri: item.imageUrl }} 
        className="w-full h-44 rounded-[32px] mb-3"
        style={{ backgroundColor: theme.dark.colors.surface }}
      />
      
      {/* Baddge de live */}
      {item.isLive && (
        <View 
          className="absolute top-3 left-3 px-2 py-1 rounded-full border border-white/10"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <Text 
            style={{ color: theme.dark.colors.live }} 
            className="text-[8px] font-black uppercase tracking-tighter"
          >
            Direct
          </Text>
        </View>
      )}
      
      {/* Bouton play décoratif */}
      <View className="absolute bottom-5 right-5 bg-white/20 p-2 rounded-full backdrop-blur-md">
        <Play size={14} color="white" fill="white" />
      </View>
    </View>
    
    {/* Catégorie */}
    <Text 
      style={{ color: theme.dark.colors.muted }} 
      className="text-[9px] uppercase font-black tracking-widest mb-1"
    >
      {item.category}
    </Text>
    
    {/* Titre de la station */}
    <Text 
      style={{ color: theme.dark.colors.text }} 
      className="font-bold text-base leading-5" 
      numberOfLines={1}
    >
      {item.title}
    </Text>
    
    {/* Description*/}
    <Text 
      style={{ color: theme.dark.colors.muted }} 
      className="text-[11px] mt-1 leading-4" 
      numberOfLines={2}
    >
      {item.description}
    </Text>
  </TouchableOpacity>
);