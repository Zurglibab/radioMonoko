import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, Alert, Share, useColorScheme } from "react-native";
import { Share2, Trash2, Globe, Edit3, X, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { Playlist } from "@/types/content";
import { CollectionService } from "@/services/collections/collection.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

interface PlaylistActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  playlist: Playlist;
  onUpdate?: (patch: Partial<Playlist>) => void;
}

export const PlaylistActionSheet = ({ isVisible, onClose, playlist, onUpdate }: PlaylistActionSheetProps) => {
  const { t } = useTranslation();
  const { appearanceSettings, token } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('library.playlistActionSheet.shareMessage', { name: playlist.name }),
      });
      onClose();
    } catch {}
  };

  const handleToggleVisibility = async () => {
    if (!token) return;
    try {
      await CollectionService.update(token, playlist.id, { is_public: !playlist.isPublic });
      onUpdate?.({ isPublic: !playlist.isPublic });
      onClose();
    } catch {
      Alert.alert(t('common.error'), t('library.playlistActionSheet.visibilityError'));
    }
  };

  const handleRename = () => {
    Alert.prompt(
      t('library.playlistActionSheet.renameTitle'),
      t('library.playlistActionSheet.renameMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.save'),
          onPress: async (name?: string) => {
            if (!name?.trim() || !token) return;
            try {
              await CollectionService.update(token, playlist.id, { name: name.trim() });
              onUpdate?.({ name: name.trim() });
            } catch {
              Alert.alert(t('common.error'), t('library.playlistActionSheet.renameError'));
            }
            onClose();
          },
        },
      ],
      "plain-text",
      playlist.name
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t('library.playlistActionSheet.deleteTitle'),
      t('library.playlistActionSheet.deleteMessage'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              await CollectionService.remove(token, playlist.id);
              onClose();
              router.back();
            } catch {
              Alert.alert(t('common.error'), t('library.playlistActionSheet.deleteError'));
            }
          },
        },
      ]
    );
  };

  /**
   * ActionItem : Ligne interactive harmonisée avec le Design System.
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
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      
      <View 
        style={{ height: '58%', backgroundColor: colors.surface, borderColor: colors.border }}
        className="rounded-t-[40px] px-6 pt-2 pb-10 border-t shadow-2xl" 
      >
        <View style={{ backgroundColor: colors.border }} className="w-12 h-1 rounded-full self-center my-4" />
        
        {/* HEADER : Titre et Statut */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text style={{ color: colors.text }} className="font-black text-xl italic tracking-tighter">
              {playlist.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text style={{ color: colors.muted }} className="text-[10px] font-bold uppercase mr-2">
                {t('library.playlistActionSheet.titlesCount', { count: playlist.items.length })}
              </Text>
              {playlist.isPublic ? (
                <Globe size={10} color={colors.primary} />
              ) : (
                <Lock size={10} color={colors.muted} />
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            style={{ backgroundColor: colors.background }}
            className="p-2 rounded-full"
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2">{t('library.playlistActionSheet.communitySection')}</Text>

          <ActionItem
            icon={<Share2 size={20} color={colors.text} />}
            label={t('library.playlistActionSheet.sendToFriend')}
            onPress={handleShare}
          />

          <ActionItem
            icon={playlist.isPublic ? <Lock size={20} color={colors.text} /> : <Globe size={20} color={colors.primary} />}
            label={playlist.isPublic ? t('library.playlistActionSheet.makePrivate') : t('library.playlistActionSheet.makePublic')}
            secondary={playlist.isPublic ? t('library.playlistActionSheet.visibleByYouOnly') : t('library.playlistActionSheet.visibleByCommunity')}
            onPress={handleToggleVisibility}
          />

          <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mt-8 mb-2">{t('library.playlistActionSheet.settingsSection')}</Text>

          <ActionItem
            icon={<Edit3 size={20} color={colors.text} />}
            label={t('library.playlistActionSheet.editName')}
            onPress={handleRename}
          />

          <ActionItem
            icon={<Trash2 size={20} color={colors.danger} />}
            label={t('library.playlistActionSheet.deletePermanently')}
            textColor={colors.danger}
            onPress={handleDelete}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};