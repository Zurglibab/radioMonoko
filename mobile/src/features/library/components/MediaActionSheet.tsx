import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert } from "react-native";
import { 
  Heart, ListPlus, PlusCircle, ScrollText, 
  PlayCircle, CheckCircle2, XCircle, X, ChevronLeft, Star 
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { Station } from "@/types/content";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useAuthContext } from "@/context/AuthContext";
import { MediaSocialInfo } from "@/features/home/components/private/MediaSocialInfo";

interface MediaActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  station: Station | null;
}

/**
 * MediaActionSheet : Menu contextuel enrichi pour le réseau social SUPCONTENT.
 * Intègre la gestion de collection et les preuves sociales (amis & notes).
 */
export const MediaActionSheet = ({ isVisible, onClose, station }: MediaActionSheetProps) => {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const { 
    updateStatus, toggleFavorite, playlists, 
    addStationToPlaylist, createPlaylistWithMedia,
    getMediaSocialData 
  } = useLibrary();

  const [view, setView] = useState<'main' | 'playlists'>('main');

  // Détection dynamique du thème
  const isDark = appearanceSettings.themeMode === 'system' ? true : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // Récupération des data via le service encapsulé dans le hook
  const socialData = useMemo(() => 
    station ? getMediaSocialData(station.id) : null
  , [station]);

  if (!station) return null;

  const handleClose = () => {
    setView('main');
    onClose();
  };

  /**
   * handleStatus : Met à jour le statut de la station dans la collection de l'utilisateur, puis affiche une confirmation contextualisée.
   * @param status Le nouveau statut à appliquer (to-listen, in-progress, finished, dropped)
   * @param label Le libellé du statut pour personnaliser le message de confirmation
   */
  const handleStatus = (status: string, label: string) => {
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
   * handleCreateNewPlaylist : Ouvre une invite pour créer une nouvelle playlist et y ajouter la station sélectionnée.
   * Utilise une alerte avec champ de saisie pour une expérience native fluide.
   */
  const handleCreateNewPlaylist = () => {
    Alert.prompt(
      "Nouvelle Playlist",
      "Entrez le nom de votre playlist",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Créer", 
          onPress: (name?: string) => {
            createPlaylistWithMedia(name || "Ma Playlist", station);
            handleClose();
          } 
        }
      ],
      "plain-text"
    );
  };

  /**
   * ActionItem : Ligne de menu stylisée "Studio"
   */
  const ActionItem = ({ icon, label, onPress, textColor, secondary = "" }: any) => (
    <TouchableOpacity 
      style={{ borderBottomColor: colors.border }}
      className="flex-row items-center py-4 border-b"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 items-center">{icon}</View>
      <View className="flex-1 ml-3">
        <Text style={{ color: textColor || colors.text }} className="text-sm font-bold">{label}</Text>
        {secondary ? <Text style={{ color: colors.muted }} className="text-[10px] font-medium">{secondary}</Text> : null}
      </View>
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
                
                {/* Note Community issue du service */}
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

            {/* PREUVE SOCIALE : Avatars des amis */}
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

              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Favoris & Playlists</Text>
              
              <ActionItem 
                icon={<Heart size={20} color={colors.live} fill={station.status ? colors.live : 'none'} />} 
                label="Ajouter aux Titres Likés" 
                onPress={() => { toggleFavorite(station); handleClose(); }} 
              />
              <ActionItem icon={<ListPlus size={20} color={colors.text} />} label="Ajouter à une playlist" onPress={() => setView('playlists')} />
              <ActionItem 
                icon={<PlusCircle size={20} color={colors.text} />} 
                label="Nouvelle playlist" 
                onPress={handleCreateNewPlaylist} 
              />

              <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mt-8 mb-2">Ma Collection</Text>
              
              <ActionItem icon={<ScrollText size={20} color={colors.muted} />} label="À écouter" onPress={() => handleStatus('to-listen', 'À écouter')} />
              <ActionItem icon={<PlayCircle size={20} color={colors.primary} />} label="En cours" onPress={() => handleStatus('in-progress', 'En cours')} />
              <ActionItem icon={<CheckCircle2 size={20} color={colors.success} />} label="Marquer comme Terminé" onPress={() => handleStatus('finished', 'Terminé')} />
              <ActionItem icon={<XCircle size={20} color={colors.danger} />} label="Abandonner" onPress={() => handleStatus('dropped', 'Abandonné')} />
            </ScrollView>
          </>
        ) : (
          /* VUE SÉLECTION PLAYLISTS */
          <View className="flex-1">
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={() => setView('main')} style={{ backgroundColor: colors.background }} className="p-2 rounded-full mr-4 border">
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">Choisir une playlist</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {playlists.map((pl) => (
                <ActionItem 
                  key={pl.id}
                  icon={<Image source={{ uri: pl.coverImage || station.imageUrl }} className="w-10 h-10 rounded-lg" />} 
                  label={pl.name} 
                  secondary={`${pl.items.length} titres`}
                  onPress={() => { 
                    addStationToPlaylist(pl.id, station); 
                    handleClose(); 
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};