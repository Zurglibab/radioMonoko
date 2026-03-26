import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, Alert, Share } from "react-native";
import { Share2, UserPlus, Trash2, Globe, Edit3, X, Lock, Users } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { Playlist } from "@/types/content";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useRouter } from "expo-router";

interface PlaylistActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  playlist: Playlist;
}

/**
 * PlaylistActionSheet : Menu contextuel pour la gestion d'une playlist.
 * Permet de modifier la visibilité, de collaborer, de renommer ou de supprimer.
 */
export const PlaylistActionSheet = ({ isVisible, onClose, playlist }: PlaylistActionSheetProps) => {
  const { 
    removePlaylist, 
    renamePlaylist, 
    toggleVisibility, 
    toggleCollaboration 
  } = useLibrary();
  const router = useRouter();

  /**
   * Partage Natif : Ouvre la feuille de partage de l'OS (iOS/Android).
   */
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvre ma playlist "${playlist.name}" sur RadioMonoko !`,
        url: `https://radiomonoko.app/playlist/${playlist.id}`,
      });
      onClose();
    } catch (error) {
      console.error("Erreur partage :", error);
    }
  };

  /**
   * Renommer : Utilise un prompt natif pour saisir le nouveau nom.
   */
  const handleRename = () => {
    Alert.prompt(
      "Renommer la playlist",
      "Entrez le nouveau nom",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Enregistrer", 
          onPress: (name?: string) => {
            if (name) renamePlaylist(playlist.id, name);
            onClose();
          } 
        }
      ],
      "plain-text",
      playlist.name // Valeur par défaut dans le champ
    );
  };

  /**
   * Suppression : Alerte de confirmation avec style destructif (Rouge sur iOS).
   */
  const handleDelete = () => {
    Alert.alert(
      "Supprimer la playlist",
      "Cette action est définitive.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            removePlaylist(playlist.id);
            onClose();
            router.back(); // On quitte la vue playlist car elle n'existe plus
          } 
        }
      ]
    );
  };

  /**
   * Item de ligne générique pour les actions.
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
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      
      <View 
        className="bg-[#121212] rounded-t-[40px] px-6 pt-2 pb-10 border-t border-white/10" 
        style={{ height: '58%' }}
      >
        <View className="w-12 h-1 bg-white/10 rounded-full self-center my-4" />
        
        {/* Header de la playlist */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white font-black text-xl italic tracking-tighter">{playlist.name}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-[10px] font-bold uppercase mr-2">
                {playlist.items.length} titres
              </Text>
              {/* Indicateur visuel du statut de confidentialité */}
              {playlist.isPublic ? (
                <Globe size={10} color={theme.dark.colors.primary} />
              ) : (
                <Lock size={10} color="#666" />
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} className="bg-white/10 p-2 rounded-full">
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2">Communauté</Text>
          
          <ActionItem 
            icon={<Share2 size={20} color="white" />} 
            label="Envoyer à un ami" 
            onPress={handleShare} 
          />
          
          {/* Toggle Collaboration */}
          <ActionItem 
            icon={<Users size={20} color={playlist.isCollaborative ? theme.dark.colors.primary : "white"} />} 
            label={playlist.isCollaborative ? "Désactiver la collaboration" : "Rendre collaborative"} 
            secondary={playlist.isCollaborative ? "🤝 Mode collaboratif actif" : "Autoriser des amis à ajouter des titres"}
            onPress={() => { toggleCollaboration(playlist.id); onClose(); }}
          />

          {/* Toggle Visibilité */}
          <ActionItem 
            icon={playlist.isPublic ? <Lock size={20} color="white" /> : <Globe size={20} color={theme.dark.colors.primary} />} 
            label={playlist.isPublic ? "Passer en privé" : "Passer en public"} 
            secondary={playlist.isPublic ? "Visible uniquement par vous" : "Visible par toute la communauté"}
            onPress={() => { toggleVisibility(playlist.id); onClose(); }}
          />

          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mt-8 mb-2">Paramètres</Text>
          
          <ActionItem 
            icon={<Edit3 size={20} color="white" />} 
            label="Modifier le nom" 
            onPress={handleRename} 
          />
          
          <ActionItem 
            icon={<Trash2 size={20} color="#F87171" />} 
            label="Supprimer définitivement" 
            color="#F87171"
            onPress={handleDelete}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};