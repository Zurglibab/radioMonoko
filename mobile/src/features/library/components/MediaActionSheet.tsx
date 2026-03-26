import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Image, Alert } from "react-native";
import { 
  Heart, ListPlus, PlusCircle, ScrollText, 
  PlayCircle, CheckCircle2, XCircle, X, ChevronLeft 
} from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Station } from "@/types/content";
import { useLibrary } from "@/hooks/home/useLibrary";

interface MediaActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  station: Station | null;
}

/**
 * MediaActionSheet : Menu contextuel global pour un média.
 * Gère l'ajout aux playlists, les statuts de collection et les favoris.
 */
export const MediaActionSheet = ({ isVisible, onClose, station }: MediaActionSheetProps) => {
  const { 
    updateStatus, toggleFavorite, playlists, 
    addStationToPlaylist, createPlaylistWithMedia 
  } = useLibrary();

  // Navigation interne (Menu principal vs Liste des playlists)
  const [view, setView] = useState<'main' | 'playlists'>('main');

  // Configuration des messages personnalisés pour l'UX
  const STATUS_MESSAGES: Record<string, string> = {
    'to-listen': "C'est noté ! On garde ça de côté pour votre prochaine session.",
    'in-progress': "Super ! Vous avez commencé l'écoute de",
    'finished': "Bravo ! Une onde de plus à votre palmarès.",
    'dropped': "Pas de souci, il y a tellement d'autres ondes à découvrir.",
  };

  if (!station) return null;

  /**
   * Ferme la modale et réinitialise la vue interne.
   */
  const handleClose = () => {
    setView('main');
    onClose();
  };

  /**
   * Gère le changement de statut avec un message personnalisé unique.
   */
  const handleStatus = (status: string, label: string) => {
    // Mise à jour de la data (Hook)
    updateStatus(station.id, status as any);

    // Construction du message UX
    let message = STATUS_MESSAGES[status] || `Ajouté à "${label}"`;
    if (status === 'in-progress') {
      message = `${message} "${station.title}"`;
    }

    // Une seule alerte propre
    Alert.alert("Collection", message, [{ text: "Génial", onPress: handleClose }]);
  };

  /**
   * Déclenche la création d'une playlist avec alerte de succès unique.
   */
  const handleCreatePlaylist = () => {
    Alert.prompt(
      "Nouvelle Playlist",
      "Entrez le nom de votre playlist",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Créer", 
          onPress: (name?: string) => {
            createPlaylistWithMedia(name || "Ma Playlist", station);
            Alert.alert("Succès", `La playlist "${name || "Ma Playlist"}" est prête !`);
            handleClose();
          } 
        }
      ],
      "plain-text"
    );
  };

  /**
   * ActionItem : Sous-composant pour les lignes du menu.
   */
  const ActionItem = ({ icon, label, onPress, color = "white", secondary = "" }: any) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 border-b border-white/5"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-10 items-center">{icon}</View>
      <View className="flex-1 ml-3">
        <Text style={{ color }} className="text-sm font-bold">{label}</Text>
        {secondary ? <Text className="text-gray-500 text-[10px] font-medium">{secondary}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/60" onPress={handleClose} />
      
      <View className="bg-[#121212] rounded-t-[40px] px-6 pt-2 pb-10 border-t border-white/10" style={{ height: '75%' }}>
        <View className="w-12 h-1 bg-white/10 rounded-full self-center my-4" />
        
        {view === 'main' ? (
          <>
            {/* Header Média */}
            <View className="flex-row items-center mb-8">
              <Image source={{ uri: station.imageUrl }} className="w-16 h-16 rounded-2xl bg-zinc-800" />
              <View className="ml-4 flex-1">
                <Text className="text-white font-black text-xl italic tracking-tighter" numberOfLines={1}>{station.title}</Text>
                <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">{station.artist}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} className="bg-white/10 p-2 rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2">Favoris & Playlists</Text>
              
              <ActionItem 
                icon={<Heart size={20} color={theme.dark.colors.primary} fill={theme.dark.colors.primary} />} 
                label="Ajouter aux Titres Likés" 
                onPress={() => { 
                  toggleFavorite(station); 
                  handleClose(); 
                }}
              />
              
              <ActionItem 
                icon={<ListPlus size={20} color="white" />} 
                label="Ajouter à une playlist" 
                onPress={() => setView('playlists')}
              />
              
              <ActionItem 
                icon={<PlusCircle size={20} color="white" />} 
                label="Créer une nouvelle playlist" 
                secondary="Le média sera ajouté automatiquement"
                onPress={handleCreatePlaylist}
              />

              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mt-8 mb-2">Ma Collection</Text>
              
              <ActionItem icon={<ScrollText size={20} color="#A0A0A0" />} label="À écouter" onPress={() => handleStatus('to-listen', 'À écouter')} />
              <ActionItem icon={<PlayCircle size={20} color={theme.dark.colors.primary} />} label="En cours" onPress={() => handleStatus('in-progress', 'En cours')} />
              <ActionItem icon={<CheckCircle2 size={20} color="#60A5FA" />} label="Marquer comme Terminé" onPress={() => handleStatus('finished', 'Terminé')} />
              <ActionItem icon={<XCircle size={20} color="#F87171" />} label="Abandonner" onPress={() => handleStatus('dropped', 'Abandonné')} />
            </ScrollView>
          </>
        ) : (
          /* Vue Playlists */
          <View className="flex-1">
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={() => setView('main')} className="bg-white/10 p-2 rounded-full mr-4">
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-black italic tracking-tighter">Choisir une playlist</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {playlists.map((pl) => (
                <ActionItem 
                  key={pl.id}
                  icon={<Image source={{ uri: pl.coverImage || station.imageUrl }} className="w-10 h-10 rounded-lg" />} 
                  label={pl.name} 
                  secondary={`${pl.items.length} éléments`}
                  onPress={() => { 
                    addStationToPlaylist(pl.id, station); 
                    Alert.alert("Playlist", `"${station.title}" a rejoint la playlist "${pl.name}" !`);
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