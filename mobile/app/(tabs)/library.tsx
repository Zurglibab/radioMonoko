import React, { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Play, ScrollText, PlayCircle, CheckCircle2, XCircle, Globe, Lock } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

import { useLibrary } from "@/hooks/home/useLibrary";
import { useCollections } from "@/hooks/collections/useCollections";
import { usePlayer } from "@/context/PlayerContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { useSanitizedStation } from "@/utils/useSanitizedStation";
import { MediaRowItem } from "@/features/shared/MediaRowItem";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { CollectionFormModal, CollectionFormData } from "@/features/library/components/CollectionFormModal";

// Mappe un frontStatus vers la clé de traduction correspondante dans library.status
const STATUS_KEY_MAP: Record<string, string> = {
  'to-listen': 'toListen',
  'in-progress': 'inProgress',
  'finished': 'finished',
  'dropped': 'dropped',
};

export default function LibraryScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { sanitizeStationId } = useSanitizedStation();
  const { activeTab, setActiveTab, favorites, isFavoritesLoading, statusItems, statuses, isStatusesLoading, refetchStatuses, refetchFavorites } = useLibrary();
  const { collections, isLoading: isCollectionsLoading, createCollection, deleteCollection, toggleVisibility, refetch: refetchCollections } = useCollections(true);
  const { playTrack } = usePlayer();
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  const lastRefetchAt = useRef<number>(0);
  const REFETCH_TTL = 30_000;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const isFirstLoad = lastRefetchAt.current === 0;
      if (!isFirstLoad && now - lastRefetchAt.current < REFETCH_TTL) return;
      lastRefetchAt.current = now;

      const silent = !isFirstLoad;
      refetchStatuses(silent);
      refetchFavorites(silent);
      refetchCollections(silent);
    }, [refetchStatuses, refetchFavorites, refetchCollections])
  );

  // Filtrage des œuvres trackées par type pour la section "Enregistrés"
  const displayedTracked = statuses.filter(s => {
    if (activeTab === "Tout") return true;
    const isPodcast = s.content.content_type === "podcast";
    return activeTab === "Radios" ? !isPodcast : isPodcast;
  });

  // Labels traduits affichés pour chaque onglet (les valeurs internes restent inchangées)
  const TAB_LABELS: Record<string, string> = {
    'Tout': t('library.library.tabs.all'),
    'Radios': t('library.library.tabs.radios'),
    'Podcasts': t('library.library.tabs.podcasts'),
    'Playlists': t('library.library.tabs.playlists'),
  };

  // Réintégration de la fonction de création appelée par le modal
  const handleCreateCollection = async (data: CollectionFormData) => {
    try {
      await createCollection(data.name, data.description, data.isPublic);
      setModalVisible(false);
      if (refetchCollections) await refetchCollections();
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('library.library.errorCreateCollection'));
    }
  };

  // Gestion d'édition/suppression au clic prolongé
  const handleLongPress = (id: string, name: string, isPublic: boolean) => {
    Alert.alert(
      t('library.library.manageCollection'),
      `"${name}"`,
      [
        {
          text: isPublic ? t('library.library.makePrivate') : t('library.library.makePublic'),
          onPress: async () => {
            await toggleVisibility(id);
            if (refetchCollections) refetchCollections();
          },
        },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            await deleteCollection(id);
            if (refetchCollections) refetchCollections();
          },
        },
        { text: t('common.cancel'), style: "cancel" },
      ]
    );
  };

  const getStatusIcon = (slug: string) => {
    switch (slug) {
      case 'to-listen': return <ScrollText size={18} color={colors.muted} />;
      case 'in-progress': return <PlayCircle size={18} color={colors.primary} />;
      case 'finished': return <CheckCircle2 size={18} color={colors.success} />;
      default: return <XCircle size={18} color={colors.danger} />;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-4 mb-6 flex-row justify-between items-center">
        <Text style={{ color: colors.text }} className="text-3xl font-black italic tracking-tighter">{t('library.library.title')}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ backgroundColor: colors.primary }} className="w-10 h-10 items-center justify-center rounded-full">
          <Plus size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filtrage horizontal */}
      <View className="max-h-12 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          {['Tout', 'Radios', 'Podcasts', 'Playlists'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)} style={{ backgroundColor: activeTab === tab ? colors.primary : colors.surface, borderColor: colors.border }} className="mr-3 px-6 py-2 rounded-full border">
              <Text style={{ color: activeTab === tab ? colors.secondary : colors.muted }} className="text-xs font-bold">{TAB_LABELS[tab]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Ma Collection */}
        {activeTab === 'Tout' && (
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">{t('library.library.myCollection')}</Text>
            <View className="flex-row flex-wrap justify-between">
              {statusItems.map((item) => {
                const statusKey = STATUS_KEY_MAP[item.slug] ?? 'toListen';
                return (
                  <TouchableOpacity key={item.slug} onPress={() => router.push(`/library/status/${item.slug}`)} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="w-[48%] p-4 mb-4 rounded-3xl flex-row items-center border">
                    <View className="mr-3">{getStatusIcon(item.slug)}</View>
                    <View>
                      <Text style={{ color: colors.text }} className="font-bold text-[11px]">{t(`library.status.${statusKey}.displayName`)}</Text>
                      <Text style={{ color: colors.muted }} className="text-[9px] font-bold">{isStatusesLoading ? "..." : t('library.library.ondesCount', { count: item.count })}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Vos Créations (Playlists + Favoris) */}
        {(activeTab === 'Tout' || activeTab === 'Playlists') && (
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">{t('library.library.yourCreations')}</Text>

            {/* Titres Likés */}
            <TouchableOpacity onPress={() => router.push("/playlist/liked")} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="flex-row items-center mb-4 p-3 rounded-2xl border">
              <View className="mr-4">
                <PlaylistCover
                  name={t('library.library.likedTitles')}
                  items={favorites.map(f => {
                    const isPod = f.content?.content_type === "podcast";
                    return {
                      id: sanitizeStationId(f.content?.api_id, f.content?.title, f.content?.description || ""),
                      title: f.content?.title || t('library.library.wave'),
                      artist: isPod ? t('library.library.podcast') : t('library.library.radioFrance'),
                      imageUrl: "",
                      type: isPod ? ("podcast" as const) : ("radio" as const)
                    };
                  })}
                  size={56}
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-bold">{t('library.library.likedTitles')}</Text>
                <Text style={{ color: colors.muted }} className="text-xs">{isFavoritesLoading ? "..." : t('library.library.playlistTitlesCount', { count: favorites.length })}</Text>
              </View>
              <MoreVertical size={18} color={colors.muted} />
            </TouchableOpacity>

            {/* Collections Personnalisées */}
            {isCollectionsLoading ? (
              <Text style={{ color: colors.muted }} className="text-xs italic py-4">{t('library.library.loadingCollections')}</Text>
            ) : collections.length === 0 ? (
              <Text style={{ color: colors.muted }} className="text-xs italic py-4">{t('library.library.noCollections')}</Text>
            ) : (
              collections.map(col => (
                <TouchableOpacity
                  key={col.id}
                  onPress={() => router.push(`/collection/${col.id}`)}
                  onLongPress={() => handleLongPress(col.id, col.name, col.is_public)}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="flex-row items-center mb-4 p-3 rounded-2xl border"
                >
                  <View className="mr-4">
                    <PlaylistCover items={[]} size={56} name={col.name} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text style={{ color: colors.text }} className="font-bold mr-2">{col.name}</Text>
                      {col.is_public ? <Globe size={12} color={colors.muted} /> : <Lock size={12} color={colors.muted} />}
                    </View>
                    <Text style={{ color: colors.muted }} className="text-xs" numberOfLines={1}>
                      {col.description || t('library.library.noDescription')}
                    </Text>
                  </View>
                  <MoreVertical size={18} color={colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Section Enregistrés */}
        {activeTab !== 'Playlists' && (
          <View>
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">{activeTab === 'Tout' ? t('library.library.saved') : TAB_LABELS[activeTab]}</Text>
            {displayedTracked.map((s, index) => {
              const isPodcast = s.content.content_type === "podcast";
              const cleanStationId = sanitizeStationId(s.apiId, s.content.title, s.content.description || "");
              const trackPayload = {
                id: cleanStationId,
                title: s.content.title,
                artist: isPodcast ? t('library.library.podcast') : t('library.library.radioFrance'),
                description: s.content.description || "",
                imageUrl: "https://www.radiofrance.fr/images/logos/fip-circle.png",
                isLive: false,
                category: "",
                type: isPodcast ? ("podcast" as const) : ("radio" as const)
              };

              return (
                <MediaRowItem
                  key={`${s.contentId}-${index}`}
                  index={index}
                  colors={colors}
                  item={trackPayload}
                  subtitle={s.frontStatus}
                  trailing={<View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="p-2.5 rounded-full border"><Play size={14} color={colors.text} fill={colors.text} /></View>}
                  onPress={() => playTrack(trackPayload)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      <CollectionFormModal visible={isModalVisible} onClose={() => setModalVisible(false)} onSubmit={handleCreateCollection} title={t('library.library.newCollection')} />
    </SafeAreaView>
  );
}