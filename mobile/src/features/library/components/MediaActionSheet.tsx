import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import { Heart, ListPlus, PlusCircle, ScrollText, PlayCircle, CheckCircle2, XCircle, X, ChevronLeft, Star, Globe, Lock, FolderPlus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { MediaStatus, Station } from "@/types/content";
import { useCollections } from "@/hooks/collections/useCollections";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useContentStatus } from "@/hooks/content/useContentStatus";
import { useAuthContext } from "@/context/AuthContext";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionFormModal, CollectionFormData } from "@/features/library/components/CollectionFormModal";

interface MediaActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  station: Station | null;
  onRefreshData?: () => Promise<void> | void; 
}

/**
 * MediaActionSheet : Composant de feuille d'action pour les œuvres (radios/podcasts).
 * Affiche des actions contextuelles pour une œuvre sélectionnée : ajout aux favoris, gestion des statuts, ajout à des collections, etc.
 * Permet également de naviguer vers l'écran de critique et de gérer la création de nouvelles collections.
 * @param param0 
 * @returns 
 */
export const MediaActionSheet = ({ isVisible, onClose, station, onRefreshData }: MediaActionSheetProps) => {
  const router = useRouter();
  const { token, appearanceSettings } = useAuthContext();
  
  const { isFavoriteByContentId, toggleFavorite: toggleFavoriteBackend } = useFavorites();
  const { currentStatus, setStatus, isLoading: isStatusLoading } = useContentStatus(station?.id ?? null);
  const { collections, isLoading: isCollectionsLoading, createCollection, addStationToCollection, refetch: refetchCollections } = useCollections(true);

  const [view, setView] = useState<'main' | 'playlists'>('main');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [stationContentId, setStationContentId] = useState<string | null>(null);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<MediaStatus | null>(null);

  const isDark = appearanceSettings.themeMode === 'system' ? true : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

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
        "Favoris",
        !isFavorite ? "Ajouté à vos Titres Likés" : "Retiré de vos Titres Likés"
      );
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de modifier le favori.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const STATUS_MESSAGES: Record<MediaStatus, string> = {
    'to-listen': "C'est noté ! On garde ça de côté.",
    'in-progress': `Vous avez commencé "${station.title}"`,
    'finished': "Bravo ! Une onde de plus à votre palmarès.",
    'dropped': "L'onde a été mise de côté.",
  };

  const handleStatus = async (status: MediaStatus) => {
    if (pendingStatus) return;
    setPendingStatus(status);
    try {
      await setStatus(station, status);
      if (onRefreshData) await onRefreshData();

      Alert.alert("Statut", STATUS_MESSAGES[status], [
        { text: "Génial", onPress: handleClose },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de mettre à jour le statut.");
    } finally {
      setPendingStatus(null);
    }
  };

  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    setAddingToId(collectionId);
    try {
      await addStationToCollection(collectionId, station);
      if (onRefreshData) await onRefreshData();
      Alert.alert("Collection", `"${station.title}" ajouté à "${collectionName}" !`, [
        { text: "Parfait", onPress: handleClose },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d'ajouter à la collection.");
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
            Alert.alert("Collection", `"${station.title}" ajouté à votre nouvelle collection !`, [
              { text: "Génial", onPress: handleClose },
            ]);
          } catch (itemErr: any) {
            setView('playlists');
            setCreateModalVisible(false);
            Alert.alert("Collection créée", "La liste est prête, vous pouvez y ajouter le titre manuellement.");
          }
        }, 200);
      }
    } catch (err: any) {
      Alert.alert("Erreur", "Impossible de générer la nouvelle collection.");
    }
  };

  const ActionItem = ({ icon, label, onPress, textColor, secondary = "", disabled = false, trailing = null, highlighted = false }: any) => (
    <TouchableOpacity
      style={{
        borderBottomColor: colors.border,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: highlighted ? colors.primary + '15' : 'transparent',
      }}
      className="flex-row items-center py-4 border-b px-2"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className="w-10 items-center">{icon}</View>
      <View className="flex-1 ml-3">
        <Text style={{ color: textColor || colors.text }} className="text-sm font-bold">{label}</Text>
        {secondary ? <Text style={{ color: colors.muted }} className="text-[10px] font-medium">{secondary}</Text> : null}
      </View>
      {trailing}
    </TouchableOpacity>
  );

  const renderStatusItem = (status: MediaStatus, icon: React.ReactNode, label: string) => {
    const isCurrent = currentStatus === status;
    const isPending = pendingStatus === status;
    return (
      <ActionItem
        icon={icon}
        label={label}
        highlighted={isCurrent}
        secondary={isCurrent ? "Statut actuel" : undefined}
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
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mb-2">Social & Communauté</Text>
              <ActionItem
                icon={<Star size={20} color={colors.primary} />}
                label="Noter et critiquer"
                secondary="Partager votre avis avec le réseau"
                onPress={() => {
                  handleClose();
                  router.push({ pathname: "/library/review/ReviewScreen", params: { id: station.brandId ?? station.id } });
                }}
              />
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Favoris & Collections</Text>
              <ActionItem
                icon={<Heart size={20} color={colors.live} fill={isFavorite ? colors.live : 'none'} />}
                label={isFavorite ? "Retirer des Titres Likés" : "Ajouter aux Titres Likés"}
                onPress={handleToggleFavorite}
                disabled={isFavoriteLoading}
                trailing={isFavoriteLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
              />
              <ActionItem icon={<ListPlus size={20} color={colors.text} />} label="Ajouter à une collection" onPress={() => setView('playlists')} />
              <ActionItem icon={<PlusCircle size={20} color={colors.text} />} label="Nouvelle collection" onPress={() => setCreateModalVisible(true)} />
              
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Ma Collection</Text>
              {isStatusLoading && !currentStatus ? (
                <View className="py-4 items-center"><ActivityIndicator size="small" color={colors.primary} /></View>
              ) : (
                <>
                  {renderStatusItem('to-listen', <ScrollText size={20} color={colors.muted} />, "À écouter")}
                  {renderStatusItem('in-progress', <PlayCircle size={20} color={colors.primary} />, "En cours")}
                  {renderStatusItem('finished', <CheckCircle2 size={20} color={colors.success} />, "Marquer comme Terminé")}
                  {renderStatusItem('dropped', <XCircle size={20} color={colors.danger} />, "Abandonner")}
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
              <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">Choisir une collection</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ActionItem icon={<FolderPlus size={20} color={colors.primary} />} label="Créer une nouvelle collection" textColor={colors.primary} onPress={() => setCreateModalVisible(true)} />
              {isCollectionsLoading ? (
                <ActivityIndicator color={colors.primary} className="mt-8" />
              ) : collections.length === 0 ? (
                <Text style={{ color: colors.muted }} className="text-xs italic text-center mt-8">Aucune collection. Créez-en une ci-dessus.</Text>
              ) : (
                collections.map((col) => (
                  <ActionItem
                    key={col.id}
                    icon={col.is_public ? <Globe size={20} color={colors.muted} /> : <Lock size={20} color={colors.muted} />}
                    label={col.name}
                    secondary={col.description || (col.is_public ? "Publique" : "Privée")}
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
      <CollectionFormModal visible={isCreateModalVisible} onClose={() => setCreateModalVisible(false)} onSubmit={handleCreateAndAdd} title="Nouvelle collection" />
    </Modal>
  );
};