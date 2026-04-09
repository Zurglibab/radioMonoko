import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Play, Music2, Mic2, ScrollText, PlayCircle, CheckCircle2, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { Station } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";

/**
 * LibraryScreen : Gestionnaire de collection personnelle.
 * Permet de naviguer entre les favoris, les podcasts enregistrés 
 * et les playlists créées par l'utilisateur.
 */
export default function LibraryScreen() {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
        
  const colors = isDark ? theme.dark.colors : theme.light.colors;
    
  const { 
    activeTab, 
    setActiveTab, 
    favorites, 
    playlists, 
    statusItems, 
    removePlaylist,
    createPlaylistWithMedia
  } = useLibrary();
  const { playTrack } = usePlayer();
  const router = useRouter();

  // Filtrage local selon l'onglet sélectionné pour l'affichage des médias
  const displayFavorites = favorites.filter((item) => {
    if (activeTab === "Tout") return true;
    if (activeTab === "Radios") return item.type === "radio";
    if (activeTab === "Podcasts") return item.type === "podcast";
    return false;
  });

  /**
   * Création rapide d'une playlist via une invite système.
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
            createPlaylistWithMedia(name || "Ma Playlist", {} as Station);
          } 
        }
      ],
      "plain-text"
    );
  };

  /**
   * Action au long press : permet de supprimer une playlist avec confirmation.
   */
  const handleLongPress = (id: string, name: string) => {
    Alert.alert("Gérer la playlist", `Voulez-vous supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => removePlaylist(id) }
    ]);
  };

  /**
   * Helper visuel : associe une icône et une couleur sémantique à chaque statut.
   */
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
      {/* Header : Titre et bouton d'ajout (Contraste inversé pour le bouton) */}
      <View className="px-6 pt-4 mb-6 flex-row justify-between items-center">
        <Text style={{ color: colors.text }} className="text-3xl font-black italic tracking-tighter">
          Ma Radio
        </Text>
        <TouchableOpacity 
          onPress={handleCreatePlaylist}
          style={{ backgroundColor: colors.primary }} 
          className="w-10 h-10 items-center justify-center rounded-full shadow-sm"
        >
          <Plus size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filtrage : Navigation horizontale par type de contenu */}
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
        
        {/* Ma Collection (Statuts d'écoute) */}
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

        {/* Vos Créations (Playlists personnelles) */}
        {(activeTab === 'Tout' || activeTab === 'Playlists') && (
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              Vos Créations
            </Text>
            
            {/* Playlist automatique : Titres Likés */}
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

            {/* Liste des playlists utilisateur */}
            {playlists.map(pl => (
              <TouchableOpacity 
                key={pl.id} 
                onPress={() => router.push(`/playlist/${pl.id}`)}
                onLongPress={() => handleLongPress(pl.id, pl.name)}
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="flex-row items-center mb-4 p-3 rounded-2xl border"
              >
                <View className="mr-4">
                  <PlaylistCover items={pl.items} size={56} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="font-bold">{pl.name}</Text>
                  <Text style={{ color: colors.muted }} className="text-xs">Par {pl.creator} • {pl.items.length} titres</Text>
                </View>
                <MoreVertical size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Liste des médias (Favoris enregistrés) */}
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
    </SafeAreaView>
  );
}