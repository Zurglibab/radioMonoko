import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, MoreVertical, Globe, Lock } from "lucide-react-native";

import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { useSanitizedStation } from "@/utils/useSanitizedStation";
import { MediaRowItem } from "@/features/shared/MediaRowItem";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { PlaylistActionSheet } from "@/features/library/components/PlaylistActionSheet";
import { Station, Playlist } from "@/types/content";
import { ContentFavorite } from "@/types/favorite";
import { CollectionService } from "@/services/collections/collection.service";

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { sanitizeStationId } = useSanitizedStation();
  
  const { playlists, favorites, token, refetchFavorites, refetchCollections } = useLibrary();
  const { playTrack } = usePlayer();
  
  const [dynamicItems, setDynamicItems] = useState<Station[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id === 'liked' && refetchFavorites) refetchFavorites();
      else if (refetchCollections) refetchCollections();
    }, [id, refetchFavorites, refetchCollections])
  );

  useEffect(() => {
    if (id === 'liked' || !id || !token) return;
    let isMounted = true;
    setIsItemsLoading(true);

    CollectionService.getItems(token, id)
      .then(async (items) => {
        const mappedStations: Station[] = items.map(item => ({
          id: item.content_id, 
          title: "Onde enregistrée", 
          artist: "RadioMonoko", 
          description: item.note || "Aucune description", 
          imageUrl: "", 
          isLive: false, 
          category: "", 
          type: "radio" as const
        }));
        if (isMounted) setDynamicItems(mappedStations);
      })
      .catch(err => console.warn("[PlaylistDetail] Error loading tracks :", err?.message))
      .finally(() => { if (isMounted) setIsItemsLoading(false); });

    return () => { isMounted = false; };
  }, [id, token]);

  const playlist: Playlist | undefined = id === 'liked' 
    ? { 
        id: 'liked', name: "Titres Likés", creator: "Vous", description: "Toutes vos ondes favorites", coverImage: "", isPublic: false, isCollaborative: false, createdAt: new Date().toISOString(),
        items: favorites.map((fav: ContentFavorite) => {
          const isPod = fav.content?.content_type === "podcast";
          const cleanStationId = sanitizeStationId(
            fav.content?.api_id,
            fav.content?.title || "",
            fav.content?.description || ""
          );

          return {
            id: cleanStationId,
            title: fav.content?.title || "Onde Likée",
            artist: isPod ? "Podcast" : "Radio France",
            description: fav.content?.description || "Titre sauvegardé",
            imageUrl: "https://www.radiofrance.fr/images/logos/fip-circle.png",
            isLive: false, 
            category: "", 
            type: isPod ? ("podcast" as const) : ("radio" as const) // Correction du type strict ici
          };
        })
      }
    : playlists.find(p => p.id === id);

  if (!playlist) return null;
  const finalItems = id === 'liked' ? playlist.items : dynamicItems;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center px-6 py-4 justify-between">
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="p-2 rounded-full border"><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <View className="flex-row items-center">
          <View className="mr-4 opacity-50">{playlist.isPublic ? <Globe size={18} color={colors.primary} /> : <Lock size={18} color={colors.muted} />}</View>
          <TouchableOpacity onPress={() => setIsOptionsVisible(true)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="p-2 rounded-full border"><MoreVertical size={24} color={colors.text} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 mt-4 mb-8">
          <PlaylistCover items={finalItems} size={220} />
          <Text style={{ color: colors.text }} className="text-3xl font-black mt-8 text-center italic tracking-tighter">{playlist.name}</Text>
          <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-row items-center mt-3 px-4 py-2 rounded-full border">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">Par {playlist.creator}</Text>
            <View style={{ backgroundColor: colors.border }} className="w-[1px] h-3 mx-3" />
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">{finalItems.length} titres</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: colors.primary }} className="w-full py-5 rounded-[24px] flex-row items-center justify-center mt-8" onPress={() => finalItems.length > 0 && playTrack(finalItems[0])}>
            <Play size={20} color={colors.secondary} fill={colors.secondary} /><Text style={{ color: colors.secondary }} className="font-black ml-3 uppercase tracking-[2px] text-xs">Lancer l'écoute</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 pb-32">
          {isItemsLoading ? (
            <ActivityIndicator color={colors.primary} className="py-8" />
          ) : finalItems.map((item, index) => (
            <MediaRowItem key={`${item.id}-${index}`} index={index} item={item} colors={colors} onPress={() => playTrack(item)} />
          ))}
        </View>
      </ScrollView>
      <PlaylistActionSheet isVisible={isOptionsVisible} onClose={() => setIsOptionsVisible(false)} playlist={{...playlist, items: finalItems}} />
    </SafeAreaView>
  );
}