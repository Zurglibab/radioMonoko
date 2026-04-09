import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, useColorScheme, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search as SearchIcon, X, Clock, Trash2, Users, Music2, Disc } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useSearch } from "@/hooks/home/useSearch";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";
import { useAuthContext } from "@/context/AuthContext";

/**
 * SearchScreen : Centre de découverte universel.
 * Permet de naviguer entre l'historique, les genres populaires et les résultats 
 * unifiés (Stations, Curateurs, Playlists).
 */
export default function SearchScreen() {
  const { query, setQuery, results, isSearching, history, addToHistory, clearHistory } = useSearch();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  // Détection du thème (Priorité Dark)
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
    
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // Calcul du volume total des résultats pour l'état vide
  const totalResults = results.stations.length + results.users.length + results.playlists.length;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Barre de recherche : Focus sur l'ergonomie et le feedback visuel */}
      <View className="px-6 pt-4 mb-4">
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="flex-row items-center border rounded-2xl px-4 py-1 h-14 shadow-sm"
        >
          <SearchIcon size={20} color={colors.muted} />
          <TextInput
            style={{ color: colors.text }}
            className="flex-1 h-full ml-3 font-bold"
            placeholder="Œuvres, curateurs, playlists..."
            placeholderTextColor={colors.muted}
            selectionColor={colors.primary}
            value={query}
            onChangeText={setQuery}
          />
          {isSearching && <ActivityIndicator size="small" color={colors.primary} className="mr-2" />}
          {query.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
               <X size={18} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {query.length === 0 ? (
          /* Vue par défaut */
          <View className="px-6 pt-2">
            
            {/* Historique : Dernières consultations */}
            {history.length > 0 && (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-5">
                  <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px]">
                    Récemment écouté
                  </Text>
                  <TouchableOpacity onPress={clearHistory} className="flex-row items-center">
                    <Trash2 size={12} color={colors.muted} />
                    <Text style={{ color: colors.muted }} className="text-[9px] font-bold uppercase ml-1">Effacer</Text>
                  </TouchableOpacity>
                </View>
                {history.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    className="flex-row items-center py-3" 
                    onPress={() => setQuery(item.title)}
                  >
                    <Clock size={16} color={colors.muted} />
                    <Text style={{ color: colors.text }} className="ml-4 font-medium opacity-80">{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Genres : Accès rapide par thématique */}
            <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px] mb-5">
              Explorer les genres
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {["Jazz", "Rock", "Techno", "Vocal", "Ambiance", "Focus"].map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
                  className="w-[48%] h-20 rounded-[24px] mb-4 border items-center justify-center shadow-sm" 
                  onPress={() => setQuery(cat)}
                >
                  <Text style={{ color: colors.text }} className="font-black text-[10px] uppercase tracking-widest">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* Vue des résultats unifiés */
          <View className="px-6 pt-2">
            
            {/* Stations & Ondes */}
            {results.stations.length > 0 && (
              <View className="mb-10">
                <View className="flex-row items-center mb-6">
                   <Disc size={18} color={colors.text} />
                   <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
                     Stations & Ondes
                   </Text>
                </View>
                <View className="flex-row flex-wrap justify-between">
                  {results.stations.map((item) => (
                    <PublicStationCard key={item.id} item={item} onPress={() => addToHistory(item)} />
                  ))}
                </View>
              </View>
            )}

            {/* Communauté et utilisateurs */}
            {results.users.length > 0 && (
              <View className="mb-10">
                <View className="flex-row items-center mb-6">
                   <Users size={18} color={colors.text} />
                   <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
                     Communauté
                   </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                  {results.users.map((u) => (
                    <TouchableOpacity key={u.id} className="items-center mr-8">
                      <Image 
                        source={{ uri: u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=222&color=fff` }} 
                        className="w-16 h-16 rounded-full border"
                        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                      />
                      <Text style={{ color: colors.text }} className="text-[10px] font-bold mt-3 uppercase tracking-tighter">
                        {u.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Playlists publiques */}
            {results.playlists.length > 0 && (
              <View className="mb-10">
                <View className="flex-row items-center mb-6">
                   <Music2 size={18} color={colors.text} />
                   <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
                     Listes de lecture
                   </Text>
                </View>
                {results.playlists.map((pl) => (
                  <TouchableOpacity 
                    key={pl.id} 
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
                    className="flex-row items-center p-4 rounded-[24px] border mb-4 shadow-sm"
                  >
                    <Image source={{ uri: pl.coverImage }} className="w-12 h-12 rounded-xl" />
                    <View className="ml-4 flex-1">
                      <Text style={{ color: colors.text }} className="font-bold text-sm tracking-tight">{pl.name}</Text>
                      <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase mt-1 opacity-70">
                        Par {pl.creator}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* État vide */}
            {totalResults === 0 && !isSearching && (
              <View className="items-center mt-20 px-10">
                <View style={{ backgroundColor: colors.surface }} className="p-6 rounded-full mb-6">
                  <X size={32} color={colors.muted} opacity={0.5} />
                </View>
                <Text style={{ color: colors.muted }} className="text-center font-bold italic opacity-60">
                  Aucune onde captée sur cette fréquence...
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Padding final pour le scroll */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}