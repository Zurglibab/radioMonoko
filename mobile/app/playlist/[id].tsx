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
import { ContentApiService } from "@/services/content/content-api.service";
import { UserService } from "@/services/users/user.service";

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { sanitizeStationId } = useSanitizedStation();

  const { favorites, token, user, refetchFavorites } = useLibrary();
  const { playTrack } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isOwnPlaylist, setIsOwnPlaylist] = useState(id === 'liked');
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(id !== 'liked');
  const [dynamicItems, setDynamicItems] = useState<Station[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id === 'liked' && refetchFavorites) refetchFavorites();
    }, [id, refetchFavorites])
  );

  useEffect(() => {
    if (id !== 'liked') return;
    setPlaylist({
      id: 'liked',
      name: "Titres Likés",
      creator: "Vous",
      description: "Toutes vos ondes favorites",
      coverImage: "",
      isPublic: false,
      isCollaborative: false,
      createdAt: new Date().toISOString(),
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
          type: isPod ? ("podcast" as const) : ("radio" as const),
        };
      }),
    });
    setIsOwnPlaylist(true);
  }, [id, favorites, sanitizeStationId]);

  useEffect(() => {
    if (id === 'liked' || !id || !token || !user?.id) return;
    let isMounted = true;
    setIsPlaylistLoading(true);

    CollectionService.getById(token, id)
      .then(async (dto) => {
        const own = dto.user_id === user.id;
        let creatorName = "Vous";
        if (!own) {
          try {
            const profile = await UserService.getById(token, dto.user_id);
            creatorName = profile.display_name ?? profile.username ?? "Utilisateur";
          } catch {
            creatorName = "Utilisateur";
          }
        }
        if (isMounted) {
          setIsOwnPlaylist(own);
          setPlaylist({
            id: dto.id,
            name: dto.name,
            creator: creatorName,
            description: dto.description ?? "",
            coverImage: "",
            isPublic: dto.is_public,
            isCollaborative: false,
            createdAt: dto.created_at,
            items: [],
          });
        }
      })
      .catch(err => {
        if (__DEV__) console.warn("[PlaylistDetail] Error loading playlist:", err?.message);
      })
      .finally(() => { if (isMounted) setIsPlaylistLoading(false); });

    return () => { isMounted = false; };
  }, [id, token, user?.id]);

  useEffect(() => {
    if (id === 'liked' || !id || !token) return;
    let isMounted = true;
    setIsItemsLoading(true);

    (async () => {
      try {
        const [items, allContents] = await Promise.all([
          CollectionService.getItems(token, id),
          ContentApiService.getAll(token),
        ]);
        const contentMap = new Map(allContents.map(c => [c.id, c]));
        const mapped: Station[] = items
          .map(item => {
            const content = contentMap.get(item.content_id);
            if (!content) return null;
            const isPodcast = content.content_type === "podcast";
            return {
              id: content.api_id,
              title: content.title,
              artist: isPodcast ? "Podcast" : "Radio France",
              description: content.description || item.note || "",
              imageUrl: "",
              isLive: false,
              category: "",
              type: isPodcast ? ("podcast" as const) : ("radio" as const),
            };
          })
          .filter((s): s is Station => s !== null);
        if (isMounted) setDynamicItems(mapped);
      } catch (err: any) {
        console.warn("[PlaylistDetail] Error loading tracks:", err?.message);
      } finally {
        if (isMounted) setIsItemsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [id, token]);

  const finalItems = id === 'liked' ? (playlist?.items ?? []) : dynamicItems;

  if (isPlaylistLoading && !playlist) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!playlist) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center px-6 py-4 justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="mr-4 opacity-50">
            {playlist.isPublic
              ? <Globe size={18} color={colors.primary} />
              : <Lock size={18} color={colors.muted} />}
          </View>
          {isOwnPlaylist && (
            <TouchableOpacity
              onPress={() => setIsOptionsVisible(true)}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="p-2 rounded-full border"
            >
              <MoreVertical size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center px-6 mt-4 mb-8">
          <PlaylistCover items={finalItems} size={220} />
          <Text style={{ color: colors.text }} className="text-3xl font-black mt-8 text-center italic tracking-tighter">
            {playlist.name}
          </Text>
          <View
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="flex-row items-center mt-3 px-4 py-2 rounded-full border"
          >
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
              Par {playlist.creator}
            </Text>
            <View style={{ backgroundColor: colors.border }} className="w-[1px] h-3 mx-3" />
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
              {finalItems.length} titres
            </Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary }}
            className="w-full py-5 rounded-[24px] flex-row items-center justify-center mt-8"
            onPress={() => finalItems.length > 0 && playTrack(finalItems[0])}
          >
            <Play size={20} color={colors.secondary} fill={colors.secondary} />
            <Text style={{ color: colors.secondary }} className="font-black ml-3 uppercase tracking-[2px] text-xs">
              Lancer l'écoute
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 pb-32">
          {isItemsLoading ? (
            <ActivityIndicator color={colors.primary} className="py-8" />
          ) : finalItems.map((item, index) => (
            <MediaRowItem
              key={`${item.id}-${index}`}
              index={index}
              item={item}
              colors={colors}
              onPress={() => playTrack(item)}
            />
          ))}
        </View>
      </ScrollView>

      {isOwnPlaylist && (
        <PlaylistActionSheet
          isVisible={isOptionsVisible}
          onClose={() => setIsOptionsVisible(false)}
          playlist={{ ...playlist, items: finalItems }}
          onUpdate={(patch) => setPlaylist(prev => prev ? { ...prev, ...patch } : prev)}
        />
      )}
    </SafeAreaView>
  );
}
