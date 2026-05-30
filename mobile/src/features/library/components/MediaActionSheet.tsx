import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert, ActivityIndicator } from "react-native";
import {
  Heart, ListPlus, PlusCircle, ScrollText,
  PlayCircle, CheckCircle2, XCircle, X, ChevronLeft, Star, Globe, Lock, FolderPlus
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { Station } from "@/types/content";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useCollections } from "@/hooks/collections/useCollections";
import { useAuthContext } from "@/context/AuthContext";
import { MediaSocialInfo } from "@/features/home/components/private/MediaSocialInfo";
import { CollectionFormModal, CollectionFormData } from "@/features/library/components/CollectionFormModal";

interface MediaActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  station: Station | null;
}

/**
 * MediaActionSheet : Menu contextuel enrichi pour le réseau social SUPCONTENT.
 * - Statuts & favoris : mock useLibrary (en attente des routes backend)
 * - Playlists : collections réelles via useCollections
 */
export const MediaActionSheet = ({ isVisible, onClose, station }: MediaActionSheetProps) => {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();

  // Mock : statuts, favoris, notation (routes backend pas encore prêtes)
  const { updateStatus, toggleFavorite, getMediaSocialData } = useLibrary();

  // Réel : les collections de l'utilisateur
  const {
    collections,
    isLoading: isCollectionsLoading,
    createCollection,
    addStationToCollection,
  } = useCollections();

  const [view, setView] = useState<'main' | 'playlists'>('main');
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);

  const isDark = appearanceSettings.themeMode === 'system' ? true : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const socialData = useMemo(() =>
    station ? getMediaSocialData(station.id) : null
  , [station]);

  if (!station) return null;

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const handleStatus = (status: string) => {
    updateStatus(station.id, status as any);
    const STATUS_MESSAGES: Record<string, string> = {
      'to-listen': "C'est noté ! On garde ça de côté.",
      'in-progress': `Vous avez commencé "${station.title}"`,
      'finished': "Bravo ! Une onde de plus à votre palmarès.",
      'dropped': "L'onde a été mise de côté.",
    };
    Alert.alert("Collection", STATUS_MESSAGES[status], [{ text: "Génial", onPress: handleClose }]);
  };

  /**
   * Ajoute la station à une collection réelle (get-or-create du content + addItem).
   */
  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    setAddingToId(collectionId);
    try {
      await addStationToCollection(collectionId, station);
      Alert.alert("Collection", `"${station.title}" ajouté à "${collectionName}" !`, [
        { text: "Parfait", onPress: handleClose },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d'ajouter à la collection.");
    } finally {
      setAddingToId(null);
    }
  };

  /**
   * Crée une nouvelle collection puis y ajoute directement la station.
   */
  const handleCreateAndAdd = async (data: CollectionFormData) => {
    const created = await createCollection(data.name, data.description, data.isPublic);
    if (created) {
      await addStationToCollection(created.id, station);
    }
    setCreateModalVisible(false);
    Alert.alert("Collection", `"${station.title}" ajouté à votre nouvelle collection !`, [
      { text: "Génial", onPress: handleClose },
    ]);
  };

  const ActionItem = ({ icon, label, onPress, textColor, secondary = "", disabled = false, trailing = null }: any) => (
    <TouchableOpacity
      style={{ borderBottomColor: colors.border, opacity: disabled ? 0.5 : 1 }}
      className="flex-row items-center py-4 border-b"
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

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/60" onPress={handleClose} />

      <View
        style={{ height: '82%', backgroundColor: colors.surface, borderColor: colors.border }}
        className="rounded-t-[40px] px-6 pt-2 pb-10 border-t shadow-2xl"
      >
        <View style={{ backgroundColor: colors.border }} className="w-12 h-1 rounded-full self-center my-4" />

        {view === 'main' ? (
          <>
            {/* HEADER : Identité + Metrics Sociales */}
            <View className="flex-row items-start mb-2">
              <Image
                source={{ uri: station.imageUrl }}
                style={{ backgroundColor: colors.background }}
                className="w-24 h-24 rounded-[32px] border border-white/5"
              />
              <View className="ml-4 flex-1 pt-2">
                <Text style={{ color: colors.text }} className="font-black text-2xl italic tracking-tighter" numberOfLines={1}>
                  {station.title}
                </Text>
                <Text style={{ color: colors.muted }} className="text-xs font-bold uppercase mb-3">
                  {station.artist}
                </Text>
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                    className="flex-row items-center px-2 py-1 rounded-lg border"
                  >
                    <Star size={10} color={colors.primary} fill={colors.primary} className="mr-1" />
                    <Text style={{ color: colors.text }} className="text-[10px] font-black">
                      {socialData?.averageRating || "Nouveau"}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted }} className="text-[10px] ml-2 font-medium">
                    ({socialData?.reviewsCount || 0} critiques)
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} className="p-2 bg-white/5 rounded-full">
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <MediaSocialInfo friends={socialData?.friendsWhoListen || []} colors={colors} />

            <ScrollView showsVerticalScrollIndicator={false} className="mt-8">
              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mb-2">Social & Communauté</Text>

              <ActionItem
                icon={<Star size={20} color={colors.primary} />}
                label="Noter et critiquer"
                secondary="Partager votre avis avec le réseau"
                onPress={() => {
                  handleClose();
                  router.push({
                    pathname: "/library/review/ReviewScreen",
                    params: { id: station.id }
                  });
                }}
              />

              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Favoris & Collections</Text>

              <ActionItem
                icon={<Heart size={20} color={colors.live} fill={station.status ? colors.live : 'none'} />}
                label="Ajouter aux Titres Likés"
                onPress={() => { toggleFavorite(station); handleClose(); }}
              />
              <ActionItem
                icon={<ListPlus size={20} color={colors.text} />}
                label="Ajouter à une collection"
                onPress={() => setView('playlists')}
              />
              <ActionItem
                icon={<PlusCircle size={20} color={colors.text} />}
                label="Nouvelle collection"
                onPress={() => setCreateModalVisible(true)}
              />

              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Ma Collection</Text>

              <ActionItem icon={<ScrollText size={20} color={colors.muted} />} label="À écouter" onPress={() => handleStatus('to-listen')} />
              <ActionItem icon={<PlayCircle size={20} color={colors.primary} />} label="En cours" onPress={() => handleStatus('in-progress')} />
              <ActionItem icon={<CheckCircle2 size={20} color={colors.success} />} label="Marquer comme Terminé" onPress={() => handleStatus('finished')} />
              <ActionItem icon={<XCircle size={20} color={colors.danger} />} label="Abandonner" onPress={() => handleStatus('dropped')} />
            </ScrollView>
          </>
        ) : (
          /* VUE SÉLECTION COLLECTIONS */
          <View className="flex-1">
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={() => setView('main')} style={{ backgroundColor: colors.background, borderColor: colors.border }} className="p-2 rounded-full mr-4 border">
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">Choisir une collection</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Raccourci : créer une nouvelle collection depuis ici */}
              <ActionItem
                icon={<FolderPlus size={20} color={colors.primary} />}
                label="Créer une nouvelle collection"
                textColor={colors.primary}
                onPress={() => setCreateModalVisible(true)}
              />

              {isCollectionsLoading ? (
                <ActivityIndicator color={colors.primary} className="mt-8" />
              ) : collections.length === 0 ? (
                <Text style={{ color: colors.muted }} className="text-xs italic text-center mt-8">
                  Aucune collection. Créez-en une ci-dessus.
                </Text>
              ) : (
                collections.map((col) => (
                  <ActionItem
                    key={col.id}
                    icon={col.is_public
                      ? <Globe size={20} color={colors.muted} />
                      : <Lock size={20} color={colors.muted} />
                    }
                    label={col.name}
                    secondary={col.description || (col.is_public ? "Publique" : "Privée")}
                    disabled={addingToId === col.id}
                    trailing={
                      addingToId === col.id
                        ? <ActivityIndicator size="small" color={colors.primary} />
                        : null
                    }
                    onPress={() => handleAddToCollection(col.id, col.name)}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Modale de création de collection (réutilisée) */}
      <CollectionFormModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateAndAdd}
        title="Nouvelle collection"
      />
    </Modal>
  );
};