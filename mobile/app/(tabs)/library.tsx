import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Play, Music2, Mic2, ScrollText, PlayCircle, CheckCircle2, XCircle, Globe, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useCollections } from "@/hooks/collections/useCollections";
import { usePlayer } from "@/context/PlayerContext";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { CollectionFormModal, CollectionFormData } from "@/features/library/components/CollectionFormModal";
import { Station } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";

/**
 * LibraryScreen : Gestionnaire de collection personnelle.
 * - "Ma Collection" (statuts) : mock useLibrary (en attente du champ status backend)
 * - "Vos Créations" (collections) : données réelles via useCollections
 * - "Enregistrés" (favoris) : mock useLibrary (pas de route favoris backend)
 */
export default function LibraryScreen() {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // Données mock (statuts + favoris) — en attente des routes backend correspondantes
  const { activeTab, setActiveTab, favorites, statusItems } = useLibrary();

  // Données réelles : les collections de l'utilisateur
  const {
    collections,
    isLoading: isCollectionsLoading,
    createCollection,
    deleteCollection,
    toggleVisibility,
  } = useCollections();

  const { playTrack } = usePlayer();
  const router = useRouter();

  // État de la modale de création
  const [isModalVisible, setModalVisible] = useState(false);

  // Filtrage local selon l'onglet sélectionné
  const displayFavorites = favorites.filter((item) => {
    if (activeTab === "Tout") return true;
    if (activeTab === "Radios") return item.type === "radio";
    if (activeTab === "Podcasts") return item.type === "podcast";
    return false;
  });

  /**
   * Création d'une collection via la modale (nom + description + confidentialité).
   */
  const handleCreateCollection = async (data: CollectionFormData) => {
    await createCollection(data.name, data.description, data.isPublic);
  };

  /**
   * Long press sur une collection : menu de gestion (visibilité, suppression).
   */
  const handleLongPress = (id: string, name: string, isPublic: boolean) => {
    Alert.alert(
      "Gérer la collection",
      `"${name}"`,
      [
        {
          text: isPublic ? "Rendre privée 🔒" : "Rendre publique 🌍",
          onPress: () => toggleVisibility(id),
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteCollection(id),
        },
        { text: "Annuler", style: "cancel" },
      ]
    );
  };

  const getStatusIcon = (name: string) => {
    switch (name) {
      case 'À écouter': return <ScrollText size={18} color={colors.muted} />;
      case 'En cours': return <PlayCircle size={18} color={colors.primary} />;
      case 'Terminé': return <CheckCircle2 size={18} color={colors.success} />;
      case 'Abandonné': return <XCircle size={18} color={colors.danger} />;
      default: return <ScrollText size={18} color={colors.muted} />;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-6 pt-4 mb-6 flex-row justify-between items-center">
        <Text style={{ color: colors.text }} className="text-3xl font-black italic tracking-tighter">
          Ma Radio
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ backgroundColor: colors.primary }}
          className="w-10 h-10 items-center justify-center rounded-full shadow-sm"
        >
          <Plus size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filtrage horizontal */}
      <View className="max-h-12 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          {['Tout', 'Radios', 'Podcasts', 'Playlists'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderColor: colors.border
              }}
              className="mr-3 px-6 py-2 rounded-full border"
            >
              <Text
                style={{ color: activeTab === tab ? colors.secondary : colors.muted }}
                className="text-xs font-bold"
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Ma Collection (statuts — mock en attendant le backend) */}
        {(activeTab === 'Tout') && (
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              Ma Collection
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {statusItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push(`/library/status/${item.slug}`)}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="w-[48%] p-4 mb-4 rounded-3xl flex-row items-center border"
                >
                  <View className="mr-3">{getStatusIcon(item.name)}</View>
                  <View>
                    <Text style={{ color: colors.text }} className="font-bold text-[11px]">{item.name}</Text>
                    <Text style={{ color: colors.muted }} className="text-[9px] font-bold">{item.count} ondes</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Vos Créations (collections réelles) */}
        {(activeTab === 'Tout' || activeTab === 'Playlists') && (
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              Vos Créations
            </Text>

            {/* Playlist automatique : Titres Likés (mock favoris) */}
            <TouchableOpacity
              onPress={() => router.push("/playlist/liked")}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="flex-row items-center mb-4 p-3 rounded-2xl border"
            >
              <View className="mr-4">
                <PlaylistCover items={favorites} size={56} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-bold">Titres Likés</Text>
                <Text style={{ color: colors.muted }} className="text-xs">Playlist • {favorites.length} titres</Text>
              </View>
              <MoreVertical size={18} color={colors.muted} />
            </TouchableOpacity>

            {/* État de chargement des collections */}
            {isCollectionsLoading ? (
              <Text style={{ color: colors.muted }} className="text-xs italic py-4">
                Chargement de vos collections...
              </Text>
            ) : collections.length === 0 ? (
              <Text style={{ color: colors.muted }} className="text-xs italic py-4">
                Aucune collection. Touchez + pour en créer une.
              </Text>
            ) : (
              collections.map(col => (
                <TouchableOpacity
                  key={col.id}
                  onPress={() => router.push(`/collection/${col.id}`)}
                  onLongPress={() => handleLongPress(col.id, col.name, col.is_public)}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="flex-row items-center mb-4 p-3 rounded-2xl border"
                >
                  {/* Pochette générique (pas d'images côté backend pour l'instant) */}
                  <View className="mr-4">
                    <PlaylistCover items={[]} size={56} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text style={{ color: colors.text }} className="font-bold mr-2">{col.name}</Text>
                      {/* Indicateur de visibilité */}
                      {col.is_public
                        ? <Globe size={12} color={colors.muted} />
                        : <Lock size={12} color={colors.muted} />
                      }
                    </View>
                    <Text style={{ color: colors.muted }} className="text-xs" numberOfLines={1}>
                      {col.description || "Sans description"}
                    </Text>
                  </View>
                  <MoreVertical size={18} color={colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Liste des médias (favoris — mock) */}
        {(activeTab !== 'Playlists') && (
          <View>
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              {activeTab === 'Tout' ? 'Enregistrés' : activeTab}
            </Text>
            {displayFavorites.map((item: Station) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => playTrack(item)}
                className="flex-row items-center mb-6"
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ backgroundColor: colors.surface }}
                  className="w-16 h-16 rounded-2xl mr-4"
                />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {item.type === 'radio'
                      ? <Music2 size={12} color={colors.primary} />
                      : <Mic2 size={12} color={colors.muted} />
                    }
                    <Text style={{ color: colors.muted }} className="text-[10px] font-bold uppercase ml-2 tracking-tighter">
                      {item.type}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ color: colors.muted }} className="text-xs">{item.artist}</Text>
                </View>
                <View
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="p-2.5 rounded-full border"
                >
                  <Play size={14} color={colors.text} fill={colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modale de création de collection */}
      <CollectionFormModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateCollection}
        title="Nouvelle collection"
      />
    </SafeAreaView>
  );
}