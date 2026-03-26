import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, MoreVertical, Clock, Globe, Lock, Users } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { PlaylistActionSheet } from "@/features/library/components/PlaylistActionSheet";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { Station, Playlist } from "@/types/content";

/**
 * PlaylistDetailScreen : Affiche le contenu détaillé d'une playlist.
 * Gère dynamiquement le cas spécial 'liked' et les playlists créées par l'utilisateur.
 */
export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { playlists, favorites } = useLibrary();
  const { playTrack } = usePlayer();
  
  // État pour contrôler l'ouverture du menu d'options (ActionSheet)
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  /**
   * Récupération des données
   * Si l'ID est 'liked', on génère une playlist virtuelle à partir des favoris.
   * Sinon, on cherche la playlist correspondante dans le store global.
   */
  const playlist: Playlist | undefined = id === 'liked' 
    ? { 
        id: 'liked',
        name: "Titres Likés", 
        items: favorites, 
        creator: "Vous", 
        description: "Toutes vos ondes favorites", 
        coverImage: "", 
        isPublic: false,
        isCollaborative: false,
        createdAt: new Date().toISOString() 
      }
    : playlists.find(p => p.id === id);

  // Sécurité : si la playlist a été supprimée ou n'existe pas, on sort proprement
  if (!playlist) return null;

  const handlePlay = (item: Station) => {
    playTrack(item);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      
      {/* Header : Barre de navigation supérieure */}
      <View className="flex-row items-center px-6 py-4 justify-between">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="bg-white/5 p-2 rounded-full active:opacity-50"
        >
          <ChevronLeft size={24} color={theme.dark.colors.text} />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          {/* Badge de confidentialité (Public / Privé) */}
          <View className="mr-4 opacity-50">
            {playlist.isPublic ? (
              <Globe size={16} color={theme.dark.colors.primary} />
            ) : (
              <Lock size={16} color={theme.dark.colors.muted} />
            )}
          </View>
          <TouchableOpacity 
            onPress={() => setIsOptionsVisible(true)} 
            className="bg-white/5 p-2 rounded-full active:opacity-50"
          >
            <MoreVertical size={24} color={theme.dark.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Hero : Visuel et Infos de la Playlist */}
        <View className="items-center px-6 mt-4 mb-8">
          {/* On réutilise le composant intelligent PlaylistCover en grand format */}
          <View className="shadow-2xl shadow-black">
            <PlaylistCover items={playlist.items} size={220} />
          </View>
          
          <Text 
            style={{ color: theme.dark.colors.text }} 
            className="text-3xl font-black mt-8 text-center italic tracking-tighter"
          >
            {playlist.name}
          </Text>

          {/* Les métadonnées : Créateur, Nombre de titres et Collaborateurs */}
          <View className="flex-row items-center mt-3 bg-white/5 px-4 py-1.5 rounded-full">
            <Text style={{ color: theme.dark.colors.muted }} className="text-[11px] font-black uppercase tracking-widest">
              Par {playlist.creator}
            </Text>
            <Text style={{ color: theme.dark.colors.border }} className="mx-2">•</Text>
            <Text style={{ color: theme.dark.colors.muted }} className="text-[11px] font-black uppercase">
              {playlist.items.length} titres
            </Text>
            {playlist.isCollaborative && (
               <>
                <Text style={{ color: theme.dark.colors.border }} className="mx-2">•</Text>
                <Users size={12} color={theme.dark.colors.primary} />
               </>
            )}
          </View>
          
          {/* Bouton d'action principal : Lancer la playlist */}
          <TouchableOpacity 
            style={{ backgroundColor: theme.dark.colors.text }}
            className="w-full py-5 rounded-[24px] flex-row items-center justify-center mt-8 shadow-lg"
            onPress={() => playlist.items.length > 0 && handlePlay(playlist.items[0])}
            activeOpacity={0.9}
          >
            <Play size={20} color={theme.dark.colors.background} fill={theme.dark.colors.background} />
            <Text 
              style={{ color: theme.dark.colors.background }} 
              className="font-black ml-3 uppercase tracking-[2px] text-xs"
            >
              Lancer l'écoute
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste des titres : Rendu vertical des pistes */}
        <View className="px-6 pb-32">
          {playlist.items.map((item, index) => (
            <TouchableOpacity 
              key={item.id || index} 
              className="flex-row items-center mb-6"
              onPress={() => handlePlay(item)}
              activeOpacity={0.6}
            >
              <Image 
                source={{ uri: item.imageUrl }} 
                className="w-14 h-14 rounded-2xl mr-4" 
                style={{ backgroundColor: theme.dark.colors.surface }}
              />
              
              <View className="flex-1">
                <Text 
                  style={{ color: theme.dark.colors.text }} 
                  className="font-bold text-base mb-0.5" 
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ color: theme.dark.colors.muted }} className="text-xs font-medium">
                  {item.artist}
                </Text>
              </View>

              {/* Indicateur de durée (pour les podcasts) */}
              <View className="flex-row items-center ml-2">
                {item.duration && (
                  <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                    <Clock size={10} color={theme.dark.colors.muted} className="mr-1" />
                    <Text style={{ color: theme.dark.colors.muted }} className="text-[9px] font-bold">
                      {item.duration}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Options : Synchronisé avec l'objet playlist actuel */}
      <PlaylistActionSheet 
        isVisible={isOptionsVisible}
        onClose={() => setIsOptionsVisible(false)}
        playlist={playlist}
      />
    </SafeAreaView>
  );
}