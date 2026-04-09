import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, MoreVertical, Clock, Globe, Lock, Users } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { PlaylistActionSheet } from "@/features/library/components/PlaylistActionSheet";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { Station, Playlist } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";

/**
 * PlaylistDetailScreen : Vue détaillée d'une collection musicale.
 * Gère l'affichage des titres likés ou des playlists créées par l'utilisateur.
 */
export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { playlists, favorites } = useLibrary();
  const { playTrack } = usePlayer();
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
  
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  /**
   * Injection des données :
   * Si ID 'liked' -> Génération d'une playlist virtuelle dynamique.
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

  if (!playlist) return null;

  const handlePlay = (item: Station) => {
    playTrack(item);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* HEADER : Navigation et Actions */}
      <View className="flex-row items-center px-6 py-4 justify-between">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border active:opacity-50"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <View className="mr-4 opacity-50">
            {playlist.isPublic ? (
              <Globe size={18} color={colors.primary} />
            ) : (
              <Lock size={18} color={colors.muted} />
            )}
          </View>
          <TouchableOpacity 
            onPress={() => setIsOptionsVisible(true)} 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="p-2 rounded-full border active:opacity-50"
          >
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HERO : Identité visuelle de la Playlist */}
        <View className="items-center px-6 mt-4 mb-8">
          <View className="shadow-2xl">
            <PlaylistCover items={playlist.items} size={220} />
          </View>
          
          <Text 
            style={{ color: colors.text }} 
            className="text-3xl font-black mt-8 text-center italic tracking-tighter"
          >
            {playlist.name}
          </Text>

          {/* BADGE INFOS : Créateur et statistiques */}
          <View 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="flex-row items-center mt-3 px-4 py-2 rounded-full border"
          >
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
              Par {playlist.creator}
            </Text>
            <View style={{ backgroundColor: colors.border }} className="w-[1px] h-3 mx-3" />
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
              {playlist.items.length} titres
            </Text>
            {playlist.isCollaborative && (
               <>
                <View style={{ backgroundColor: colors.border }} className="w-[1px] h-3 mx-3" />
                <Users size={12} color={colors.primary} />
               </>
            )}
          </View>
          
          {/* ACTION : Bouton Play Principal */}
          <TouchableOpacity 
            style={{ backgroundColor: colors.primary }}
            className="w-full py-5 rounded-[24px] flex-row items-center justify-center mt-8"
            onPress={() => playlist.items.length > 0 && handlePlay(playlist.items[0])}
            activeOpacity={0.9}
          >
            <Play size={20} color={colors.secondary} fill={colors.secondary} />
            <Text 
              style={{ color: colors.secondary }} 
              className="font-black ml-3 uppercase tracking-[2px] text-xs"
            >
              Lancer l'écoute
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTE DES PISTES : Rendu vertical des médias */}
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
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                className="w-14 h-14 rounded-2xl mr-4" 
              />
              
              <View className="flex-1">
                <Text 
                  style={{ color: colors.text }} 
                  className="font-bold text-base mb-0.5" 
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs font-medium">
                  {item.artist}
                </Text>
              </View>

              {/* DURÉE : Badge discret (ex: pour les podcasts) */}
              {item.duration && (
                <View 
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="flex-row items-center px-2 py-1 rounded-lg border ml-2"
                >
                  <Clock size={10} color={colors.muted} className="mr-1" />
                  <Text style={{ color: colors.muted }} className="text-[9px] font-bold">
                    {item.duration}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL : Menu d'actions contextuelles */}
      <PlaylistActionSheet 
        isVisible={isOptionsVisible}
        onClose={() => setIsOptionsVisible(false)}
        playlist={playlist}
      />
    </SafeAreaView>
  );
}