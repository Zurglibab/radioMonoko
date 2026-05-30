import React from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Globe, Lock, Trash2, Disc3, Music2, FolderOpen } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useCollectionDetail } from "@/hooks/collections/useCollectionDetail";

/**
 * CollectionDetailScreen : Affiche le contenu d'une collection (liste personnalisée).
 * Permet de consulter les œuvres qu'elle contient et de les retirer.
 * Couvre l'item "Ajout et suppression d'œuvres dans ces listes" du barème.
 */
export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams();
  const collectionId = id as string;
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const { collection, items, isLoading, error, removeItem } = useCollectionDetail(collectionId);

  /**
   * Confirmation avant retrait d'une œuvre.
   */
  const handleRemove = (contentId: string, title: string) => {
    Alert.alert(
      "Retirer de la collection",
      `Retirer "${title}" de cette collection ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Retirer", style: "destructive", onPress: () => removeItem(contentId) },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header navigation */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter flex-1" numberOfLines={1}>
          {collection?.name || "Collection"}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} className="mt-20" />
        ) : error ? (
          <View className="items-center mt-20 px-10">
            <FolderOpen size={48} color={colors.border} />
            <Text style={{ color: colors.muted }} className="mt-4 font-bold italic text-center">
              {error}
            </Text>
          </View>
        ) : (
          <>
            {/* En-tête de la collection : description + visibilité + compteur */}
            {collection && (
              <View className="px-6 mb-8">
                {collection.description ? (
                  <Text style={{ color: colors.muted }} className="text-sm leading-5 mb-4">
                    {collection.description}
                  </Text>
                ) : null}
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    className="flex-row items-center px-3 py-1.5 rounded-full border mr-3"
                  >
                    {collection.is_public
                      ? <Globe size={12} color={colors.muted} />
                      : <Lock size={12} color={colors.muted} />
                    }
                    <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase ml-2 tracking-widest">
                      {collection.is_public ? "Publique" : "Privée"}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
                    {items.length} œuvre{items.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            )}

            {/* Liste des œuvres */}
            {items.length === 0 ? (
              <View className="items-center mt-16 px-10">
                <View
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="p-8 rounded-[40px] mb-6 border"
                >
                  <Disc3 size={40} color={colors.muted} opacity={0.3} />
                </View>
                <Text style={{ color: colors.text }} className="text-lg font-black italic text-center mb-2">
                  Collection vide
                </Text>
                <Text style={{ color: colors.muted }} className="text-sm text-center mb-8 leading-5">
                  Ajoutez des œuvres depuis leur fiche pour les retrouver ici.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: colors.primary }}
                  className="px-8 py-4 rounded-full flex-row items-center"
                  onPress={() => router.push("/(tabs)/search")}
                >
                  <Music2 size={18} color={colors.secondary} />
                  <Text style={{ color: colors.secondary }} className="font-black uppercase text-xs tracking-widest ml-2">
                    Explorer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="px-6">
                {items.map((item) => {
                  const title = item.content?.title || "Œuvre indisponible";
                  return (
                    <View
                      key={item.contentId}
                      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                      className="flex-row items-center mb-4 p-4 rounded-2xl border"
                    >
                      {/* Pochette générique (pas d'image côté backend) */}
                      <View
                        style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4 border"
                      >
                        <Disc3 size={20} color={colors.muted} />
                      </View>

                      <View className="flex-1">
                        <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
                          {title}
                        </Text>
                        {/* Note personnelle si présente */}
                        {item.note ? (
                          <Text style={{ color: colors.muted }} className="text-xs italic mt-0.5" numberOfLines={2}>
                            « {item.note} »
                          </Text>
                        ) : (
                          <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-bold tracking-widest mt-0.5">
                            {item.content?.content_type || "—"}
                          </Text>
                        )}
                      </View>

                      {/* Bouton retrait */}
                      <TouchableOpacity
                        onPress={() => handleRemove(item.contentId, title)}
                        className="p-2.5 active:opacity-50"
                      >
                        <Trash2 size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}