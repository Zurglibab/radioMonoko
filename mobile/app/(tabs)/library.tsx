import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MoreVertical, Play, Music2, Mic2, ScrollText, PlayCircle, CheckCircle2, XCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { PlaylistCover } from "@/features/home/components/private/PlaylistCover";
import { Station } from "@/types/content";

/**
 * LibraryScreen : Gestionnaire de collection personnelle.
 * Permet de naviguer entre les favoris, les podcasts enregistrés 
 * et les playlists créées par l'utilisateur.
 */
export default function LibraryScreen() {
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

  // Filtrage local selon l'onglet sélectionné
  const displayFavorites = favorites.filter((item) => {
    if (activeTab === "Tout") return true;
    if (activeTab === "Radios") return item.type === "radio";
    if (activeTab === "Podcasts") return item.type === "podcast";
    return false;
  });

  /**
   * Création rapide d'une playlist.
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
            // Création avec une station vide
            createPlaylistWithMedia(name || "Ma Playlist", {} as Station);
          } 
        }
      ],
      "plain-text"
    );
  };

  /**
   * Action au long press : permet de supprimer une playlist.
   */
  const handleLongPress = (id: string, name: string) => {
    Alert.alert("Gérer la playlist", `Voulez-vous supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => removePlaylist(id) }
    ]);
  };

  /**
   * Helper visuel : associe une icône et une couleur à chaque statut de collection.
   */
  const getStatusIcon = (name: string) => {
    switch (name) {
      case 'À écouter': return <ScrollText size={18} color={theme.dark.colors.muted} />;
      case 'En cours': return <PlayCircle size={18} color={theme.dark.colors.primary} />;
      case 'Terminé': return <CheckCircle2 size={18} color="#60A5FA" />;
      case 'Abandonné': return <XCircle size={18} color="#F87171" />;
      default: return <ScrollText size={18} color={theme.dark.colors.muted} />;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      {/* Header : Titre principal et bouton d'ajout rapide */}
      <View className="px-6 pt-4 mb-6 flex-row justify-between items-center">
        <Text style={{ color: theme.dark.colors.text }} className="text-3xl font-black italic tracking-tighter">
          Ma Radio
        </Text>
        <TouchableOpacity 
          onPress={handleCreatePlaylist}
          style={{ backgroundColor: theme.dark.colors.text }} 
          className="w-10 h-10 items-center justify-center rounded-full shadow-sm"
        >
          <Plus size={20} color={theme.dark.colors.background} />
        </TouchableOpacity>
      </View>

      {/* Filtres de navigation horizontaux */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-10 mb-6 px-6">
        {['Tout', 'Radios', 'Podcasts', 'Playlists'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab as any)}
            className={`mr-4 px-6 py-2 rounded-full border ${
              activeTab === tab ? 'bg-white border-white' : 'border-white/10'
            }`}
          >
            <Text className={`text-xs font-bold ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* SECTION 1 : MA COLLECTION, Uniquement sur l'onglet 'Tout' */}
        {(activeTab === 'Tout') && (
          <View className="mb-10">
            <Text style={{ color: theme.dark.colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              Ma Collection
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {statusItems.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  className="w-[48%] p-4 mb-4 rounded-3xl flex-row items-center border"
                  style={{ backgroundColor: theme.dark.colors.surface, borderColor: 'rgba(255,255,255,0.05)' }}
                  onPress={() => router.push(`/library/status/${item.slug}`)}
                >
                  <View className="mr-3">{getStatusIcon(item.name)}</View>
                  <View>
                    <Text style={{ color: theme.dark.colors.text }} className="font-bold text-[11px]">{item.name}</Text>
                    <Text style={{ color: theme.dark.colors.muted }} className="text-[9px] font-bold">{item.count} ondes</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* SECTION 2 : VOS CRÉATIONS (Mes playlists personnelles) */}
        {(activeTab === 'Tout' || activeTab === 'Playlists') && (
          <View className="mb-10">
            <Text style={{ color: theme.dark.colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              Vos Créations
            </Text>
            
            {/* Playlist spéciale : Titres Likés (Automatique) */}
            <TouchableOpacity 
              className="flex-row items-center mb-4 p-3 rounded-2xl border"
              style={{ backgroundColor: theme.dark.colors.surface, borderColor: 'rgba(255,255,255,0.05)' }}
              onPress={() => router.push("/playlist/liked")}
            >
              <View className="mr-4">
                <PlaylistCover items={favorites} size={56} />
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.dark.colors.text }} className="font-bold">Titres Likés</Text>
                <Text style={{ color: theme.dark.colors.muted }} className="text-xs">Playlist • {favorites.length} titres</Text>
              </View>
            </TouchableOpacity>

            {/* Liste des playlists personnalisées */}
            {playlists.map(pl => (
              <TouchableOpacity 
                key={pl.id} 
                className="flex-row items-center mb-4 p-3 rounded-2xl border"
                style={{ backgroundColor: theme.dark.colors.surface, borderColor: 'rgba(255,255,255,0.05)' }}
                onPress={() => router.push(`/playlist/${pl.id}`)}
                onLongPress={() => handleLongPress(pl.id, pl.name)}
              >
                <View className="mr-4">
                  <PlaylistCover items={pl.items} size={56} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.dark.colors.text }} className="font-bold">{pl.name}</Text>
                  <Text style={{ color: theme.dark.colors.muted }} className="text-xs">Par {pl.creator} • {pl.items.length} titres</Text>
                </View>
                <MoreVertical size={18} color={theme.dark.colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SECTION 3 : Liste des médias (Enregistrés) */}
        {(activeTab !== 'Playlists') && (
          <View>
            <Text style={{ color: theme.dark.colors.muted }} className="text-[10px] font-black uppercase tracking-widest mb-4">
              {activeTab === 'Tout' ? 'Enregistrés' : activeTab}
            </Text>
            {displayFavorites.map((item: Station) => (
              <TouchableOpacity 
                key={item.id} 
                className="flex-row items-center mb-6"
                onPress={() => playTrack(item)}
              >
                <Image 
                  source={{ uri: item.imageUrl }} 
                  className="w-16 h-16 rounded-2xl mr-4" 
                  style={{ backgroundColor: theme.dark.colors.surface }} 
                />
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {item.type === 'radio' ? <Music2 size={12} color={theme.dark.colors.primary} /> : <Mic2 size={12} color={theme.dark.colors.muted} />}
                    <Text style={{ color: theme.dark.colors.muted }} className="text-[10px] font-bold uppercase ml-2 tracking-tighter">{item.type}</Text>
                  </View>
                  <Text style={{ color: theme.dark.colors.text }} className="font-bold text-base" numberOfLines={1}>{item.title}</Text>
                  <Text style={{ color: theme.dark.colors.muted }} className="text-xs">{item.artist}</Text>
                </View>
                <View className="bg-white/10 p-2 rounded-full border border-white/5">
                   <Play size={14} color={theme.dark.colors.text} fill={theme.dark.colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}