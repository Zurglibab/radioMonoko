import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, Mic2, Music2, Search, Disc3 } from "lucide-react-native";

import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useCollections } from "@/hooks/collections/useCollections";
import { useCollectionItems } from "@/hooks/collections/useCollectionItems";
import { CollectionItem } from "@/types/collection";
import { Station, MediaStatus } from "@/types/content";
import { findSystemMeta } from "@/constants/library-status";

/**
 * StatusDetailScreen : Affiche les œuvres d'une collection système
 * (À écouter / En cours / Terminé / Abandonné).
 *
 * Résout d'abord la collection système correspondant au slug (créée à la
 * volée si l'utilisateur n'a encore jamais utilisé ce statut), puis charge
 * ses items enrichis via le helper réutilisable.
 */
export default function StatusDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const { playTrack } = usePlayer();
  const { ensureSystemCollection } = useCollections();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const statusMeta = findSystemMeta(slug as MediaStatus);
  const currentTitle = statusMeta?.displayName || "Ma Collection";

  // Résolution de la collection système (peut nécessiter une création à la volée)
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    if (!statusMeta) return;
    setIsResolving(true);
    ensureSystemCollection(statusMeta.frontStatus)
      .then(col => { setCollectionId(col.id); setResolveError(null); })
      .catch(err => {
        if (__DEV__) console.warn("[StatusDetail] résolution collection", err?.message);
        setResolveError("Impossible d'accéder à cette liste.");
      })
      .finally(() => setIsResolving(false));
  }, [statusMeta, ensureSystemCollection]);

  // Items enrichis via le helper réutilisable
  const { items, isLoading: isItemsLoading, error: itemsError } =
    useCollectionItems(collectionId);

  const isLoading = isResolving || isItemsLoading;
  const error = resolveError || itemsError;

  /**
   * Reconstruit un Station minimal depuis un CollectionItem pour le player.
   */
  const handlePlay = (item: CollectionItem) => {
    if (!item.content) return;
    const station: Station = {
      id: item.content.api_id,
      title: item.content.title,
      artist: "",
      description: item.content.description,
      imageUrl: "",
      isLive: true,
      category: "Radio",
      type: item.content.content_type === 'podcast' ? 'podcast' : 'radio',
    };
    playTrack(station);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-2xl font-black italic tracking-tighter">
          {currentTitle}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} className="mt-20" />
        ) : error ? (
          <View className="items-center mt-20 px-10">
            <Text style={{ color: colors.muted }} className="text-sm italic text-center">
              {error}
            </Text>
          </View>
        ) : items.length > 0 ? (
          <View className="px-6 py-4">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase mb-8 tracking-widest">
              {items.length} contenu{items.length > 1 ? 's' : ''} enregistré{items.length > 1 ? 's' : ''}
            </Text>

            {items.map((item) => {
              const title = item.content?.title || "Œuvre indisponible";
              const isPodcast = item.content?.content_type === 'podcast';

              return (
                <TouchableOpacity
                  key={item.contentId}
                  className="flex-row items-center mb-6"
                  onPress={() => handlePlay(item)}
                  disabled={!item.content}
                  activeOpacity={0.7}
                >
                  <View
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    className="w-14 h-14 rounded-2xl mr-4 border items-center justify-center"
                  >
                    <Disc3 size={20} color={colors.muted} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      {isPodcast
                        ? <Mic2 size={12} color={colors.muted} />
                        : <Music2 size={12} color={colors.primary} />
                      }
                      <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase ml-2 tracking-tighter">
                        {isPodcast ? 'podcast' : 'radio'}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
                      {title}
                    </Text>
                    {item.note ? (
                      <Text style={{ color: colors.muted }} className="text-xs italic" numberOfLines={1}>
                        « {item.note} »
                      </Text>
                    ) : item.content?.description ? (
                      <Text style={{ color: colors.muted }} className="text-xs" numberOfLines={1}>
                        {item.content.description}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: item.content ? 1 : 0.4,
                    }}
                    className="p-2.5 rounded-full border"
                  >
                    <Play size={14} color={colors.text} fill={colors.text} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Empty state */
          <View className="flex-1 items-center justify-center py-40 px-10">
            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="p-8 rounded-[40px] mb-6 border shadow-sm"
            >
              <Search size={40} color={colors.muted} opacity={0.3} />
            </View>
            <Text style={{ color: colors.text }} className="text-lg font-black italic text-center mb-2">
              C'est encore vide ici
            </Text>
            <Text style={{ color: colors.muted }} className="text-sm text-center mb-10 leading-5">
              Les médias que vous marquerez comme "{currentTitle}" apparaîtront ici pour un accès rapide.
            </Text>

            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="px-8 py-4 rounded-full flex-row items-center shadow-xl"
              onPress={() => router.push("/(tabs)/search")}
            >
              <Search size={18} color={colors.secondary} />
              <Text style={{ color: colors.secondary }} className="font-black uppercase text-xs tracking-widest ml-2">
                Découvrir des ondes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}