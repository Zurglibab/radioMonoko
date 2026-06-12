import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { Heart, ListPlus, PlusCircle, ScrollText, PlayCircle, CheckCircle2, XCircle, X, ChevronLeft, Star, Globe, Lock, FolderPlus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { MediaStatus, Station } from "@/types/content";
import { useCollections } from "@/hooks/collections/useCollections";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useContentStatus } from "@/hooks/content/useContentStatus";
import { useAuthContext } from "@/context/AuthContext";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionFormModal, CollectionFormData } from "@/features/library/components/CollectionFormModal";
import { ActionSheetItem } from "@/features/library/components/ActionSheetItem";

interface MediaActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  station: Station | null;
  onRefreshData?: () => Promise<void> | void; 
}

export const MediaActionSheet = ({ isVisible, onClose, station, onRefreshData }: MediaActionSheetProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useAuthContext();
  
  const { isFavoriteByContentId, toggleFavorite: toggleFavoriteBackend } = useFavorites();
  const { currentStatus, setStatus, isLoading: isStatusLoading } = useContentStatus(station?.id ?? null);
  const { collections, isLoading: isCollectionsLoading, createCollection, addStationToCollection, refetch: refetchCollections } = useCollections(true);

  const [view, setView] = useState<'main' | 'playlists'>('main');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [stationContentId, setStationContentId] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<MediaStatus | null>(null);

  const colors = useThemeColors();

  useEffect(() => {
    if (isVisible && refetchCollections) {
      refetchCollections();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!station?.id || !token) {
      setStationContentId(null);
      return;
    }
    let cancelled = false;
    ContentApiService.findByApiId(token, station.id)
      .then(content => {
        if (!cancelled) setStationContentId(content?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setStationContentId(null);
      });
    return () => { cancelled = true; };
  }, [station?.id, token]);

  const isFavorite = stationContentId ? isFavoriteByContentId(stationContentId) : false;

  if (!station) return null;

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const handleToggleFavorite = async () => {
    if (isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    try {
      const contentId = await ContentApiService.resolveContentId(token!, station.id, {
        title: station.title,
        description: station.description || "",
        content_type: station.type === 'podcast' ? 'podcast' : 'show',
      });

      await toggleFavoriteBackend(station);
      setStationContentId(contentId);

      if (onRefreshData) await onRefreshData();

      Alert.alert(
        t('library.mediaActionSheet.favoritesTitle'),
        !isFavorite ? t('library.mediaActionSheet.addedToLiked') : t('library.mediaActionSheet.removedFromLiked')
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('library.mediaActionSheet.favoriteError'));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const STATUS_MESSAGES: Record<MediaStatus, string> = {
    'to-listen': t('library.mediaActionSheet.statusMessages.toListen'),
    'in-progress': t('library.mediaActionSheet.statusMessages.inProgress', { title: station.title }),
    'finished': t('library.mediaActionSheet.statusMessages.finished'),
    'dropped': t('library.mediaActionSheet.statusMessages.dropped'),
  };

  const handleStatus = async (status: MediaStatus) => {
    if (pendingStatus) return;
    setPendingStatus(status);
    try {
      await setStatus(station, status);
      if (onRefreshData) await onRefreshData();

      Alert.alert(t('library.mediaActionSheet.statusTitle'), STATUS_MESSAGES[status], [
        { text: t('library.mediaActionSheet.great'), onPress: handleClose },
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('library.mediaActionSheet.statusUpdateError'));
    } finally {
      setPendingStatus(null);
    }
  };

  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    setAddingToId(collectionId);
    try {
      await addStationToCollection(collectionId, station);
      if (onRefreshData) await onRefreshData();
      Alert.alert(t('library.mediaActionSheet.collectionTitle'), t('library.mediaActionSheet.addedToCollection', { title: station.title, collectionName }), [
        { text: t('library.mediaActionSheet.perfect'), onPress: handleClose },
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('library.mediaActionSheet.addToCollectionError'));
    } finally {
      setAddingToId(null);
    }
  };

  const handleCreateAndAdd = async (data: CollectionFormData) => {
    try {
      const created = await createCollection(data.name, data.description, data.isPublic);

      if (refetchCollections) await refetchCollections();

      if (created) {
        setTimeout(async () => {
          try {
            await addStationToCollection(created.id, station);
            if (onRefreshData) await onRefreshData();
            setCreateModalVisible(false);
            Alert.alert(t('library.mediaActionSheet.collectionTitle'), t('library.mediaActionSheet.addedToNewCollection', { title: station.title }), [
              { text: t('library.mediaActionSheet.great'), onPress: handleClose },
            ]);
          } catch (itemErr: any) {
            setView('playlists');
            setCreateModalVisible(false);
            Alert.alert(t('library.mediaActionSheet.createdCollectionTitle'), t('library.mediaActionSheet.createdCollectionMessage'));
          }
        }, 200);
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), t('library.mediaActionSheet.createCollectionError'));
    }
  };

  const renderStatusItem = (status: MediaStatus, icon: React.ReactNode, label: string) => {
    const isCurrent = currentStatus === status;
    const isPending = pendingStatus === status;
    return (
      <ActionSheetItem
        icon={icon}
        label={label}
        highlighted={isCurrent}
        secondary={isCurrent ? t('library.mediaActionSheet.currentStatus') : undefined}
        disabled={!!pendingStatus}
        trailing={isPending ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        onPress={() => handleStatus(status)}
      />
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/60" onPress={handleClose} />
      <View style={{ height: '82%', backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-t-[40px] px-6 pt-2 pb-10 border-t shadow-2xl">
        <View style={{ backgroundColor: colors.border }} className="w-12 h-1 rounded-full self-center my-4" />
        {view === 'main' ? (
          <>
            <View className="flex-row items-start mb-2">
              <Image source={{ uri: station.imageUrl }} style={{ backgroundColor: colors.background }} className="w-24 h-24 rounded-[32px] border border-white/5" />
              <View className="ml-4 flex-1 pt-2">
                <Text style={{ color: colors.text }} className="font-black text-2xl italic tracking-tighter" numberOfLines={1}>{station.title}</Text>
                <Text style={{ color: colors.muted }} className="text-xs font-bold uppercase mb-3">{station.artist}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} className="p-2 bg-white/5 rounded-full">
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="mt-8">
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mb-2">{t('library.mediaActionSheet.socialSection')}</Text>
              <ActionSheetItem
                icon={<Star size={20} color={colors.primary} />}
                label={t('library.mediaActionSheet.rateAndReview')}
                secondary={t('library.mediaActionSheet.shareOpinion')}
                onPress={() => {
                  handleClose();
                  router.push({ pathname: "/library/review/ReviewScreen", params: { id: station.brandId ?? station.id } });
                }}
              />
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">{t('library.mediaActionSheet.favoritesSection')}</Text>
              <ActionSheetItem
                icon={<Heart size={20} color={colors.live} fill={isFavorite ? colors.live : 'none'} />}
                label={isFavorite ? t('library.mediaActionSheet.removeFromLiked') : t('library.mediaActionSheet.addToLiked')}
                onPress={handleToggleFavorite}
                disabled={isFavoriteLoading}
                trailing={isFavoriteLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
              />
              <ActionSheetItem icon={<ListPlus size={20} color={colors.text} />} label={t('library.mediaActionSheet.addToCollection')} onPress={() => setView('playlists')} />
              <ActionSheetItem icon={<PlusCircle size={20} color={colors.text} />} label={t('library.mediaActionSheet.newCollection')} onPress={() => setCreateModalVisible(true)} />

              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">{t('library.mediaActionSheet.myCollectionSection')}</Text>
              {isStatusLoading && !currentStatus ? (
                <View className="py-4 items-center"><ActivityIndicator size="small" color={colors.primary} /></View>
              ) : (
                <>
                  {renderStatusItem('to-listen', <ScrollText size={20} color={colors.muted} />, t('library.mediaActionSheet.statusActions.toListen'))}
                  {renderStatusItem('in-progress', <PlayCircle size={20} color={colors.primary} />, t('library.mediaActionSheet.statusActions.inProgress'))}
                  {renderStatusItem('finished', <CheckCircle2 size={20} color={colors.success} />, t('library.mediaActionSheet.statusActions.finished'))}
                  {renderStatusItem('dropped', <XCircle size={20} color={colors.danger} />, t('library.mediaActionSheet.statusActions.dropped'))}
                </>
              )}
            </ScrollView>
          </>
        ) : (
          <View className="flex-1">
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={() => setView('main')} style={{ backgroundColor: colors.background, borderColor: colors.border }} className="p-2 rounded-full mr-4 border">
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">{t('library.mediaActionSheet.chooseCollection')}</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ActionSheetItem icon={<FolderPlus size={20} color={colors.primary} />} label={t('library.mediaActionSheet.createNewCollection')} textColor={colors.primary} onPress={() => setCreateModalVisible(true)} />
              {isCollectionsLoading ? (
                <ActivityIndicator color={colors.primary} className="mt-8" />
              ) : collections.length === 0 ? (
                <Text style={{ color: colors.muted }} className="text-xs italic text-center mt-8">{t('library.mediaActionSheet.noCollectionsCreateOne')}</Text>
              ) : (
                collections.map((col) => (
                  <ActionSheetItem
                    key={col.id}
                    icon={col.is_public ? <Globe size={20} color={colors.muted} /> : <Lock size={20} color={colors.muted} />}
                    label={col.name}
                    secondary={col.description || (col.is_public ? t('common.public') : t('common.private'))}
                    disabled={addingToId === col.id}
                    trailing={addingToId === col.id ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                    onPress={() => handleAddToCollection(col.id, col.name)}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
      <CollectionFormModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreateAndAdd} title={t('library.mediaActionSheet.newCollection')} />
    </Modal>
  );
};