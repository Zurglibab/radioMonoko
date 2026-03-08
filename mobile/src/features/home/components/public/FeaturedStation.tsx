import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlayCircle } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { usePlayer } from "@/context/PlayerContext";

/**
 * FeaturedStation : Composant de la Hero.
 * Utilisé pour présenter la station phare ou le live du moment avec un visuel fort.
 * @param station : Objet contenant les infos de la station (id, title, category, imageUrl, ListenersCount).
 */
export const FeaturedStation = ({ station }: { station: any }) => {
  const { playTrack } = usePlayer();
  
  return (
    <View className="px-6 mb-12">
      <TouchableOpacity 
        activeOpacity={0.9} 
        // Injection directe des données dans le lecteur global au clic
        onPress={() => playTrack({ 
          id: station.id, 
          title: station.title, 
          artist: station.category, 
          image: station.imageUrl 
        })}
        className="relative h-80 rounded-[44px] overflow-hidden border border-white/5"
      >
        {/* Image de fond en position absolue pour couvrir toute la carte */}
        <Image 
          source={{ uri: station.imageUrl }} 
          className="absolute inset-0 w-full h-full" 
        />

        {/* Dégradé pour assurer la lisibilité du texte blanc sur n'importe quelle image */}
        <LinearGradient 
          colors={['transparent', 'rgba(0,0,0,0.95)']} 
          className="absolute inset-0 p-8 justify-end"
        >
          {/* BADGE LIVE ET CATÉGORIE */}
          <View className="flex-row items-center mb-4">
            <View 
              style={{ backgroundColor: theme.dark.colors.live }} 
              className="px-3 py-1 rounded-full shadow-lg"
            >
              <Text className="text-white text-[10px] font-black italic">LIVE</Text>
            </View>
            <Text className="text-white/60 text-[10px] ml-3 font-bold uppercase tracking-widest">
              {station.category}
            </Text>
          </View>

          {/* Titre de la station */}
          <Text className="text-white text-3xl font-black mb-3 leading-8 tracking-tighter">
            {station.title}
          </Text>

          {/* Indicateur du nombre d'auditeurs */}
          <View className="flex-row items-center bg-white/10 self-start px-4 py-2 rounded-2xl border border-white/5">
            <PlayCircle size={20} color="white" />
            <Text className="text-white ml-3 font-bold text-xs">
              {station.ListenersCount?.toLocaleString()} auditeurs
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};