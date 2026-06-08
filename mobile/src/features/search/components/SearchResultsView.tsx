import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Disc, Radio, List, Users, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";
import { Station } from "@/types/content";

/**
 * Labels pour les types de contenu, 
 * utilisés dans la vue des résultats de recherche pour indiquer le type d'émission ou de diffusion.
 */
const CONTENT_TYPE_LABEL: Record<string, string> = {
  show: "Émission",
  diffusion: "Diffusion",
  live: "Direct",
  podcast: "Podcast",
  article: "Article",
  other: "Contenu",
};

/**
 * Propriétés attendues par la vue des résultats de recherche, incluant les différentes catégories de résultats, 
 * l'état de recherche, la requête, les fonctions pour gérer l'historique et la lecture, ainsi que les couleurs du thème.
 */
interface SearchResultsViewProps {
  stations: Station[];
  users: any[];
  contents: any[];
  publicCollections: any[];
  isSearching: boolean;
  query: string;
  addToHistory: (q: string) => void;
  currentTrack: Station | null;
  isPlaying: boolean;
  onPlayPress: (s: Station) => void;
  onLongPress: (s: Station) => void;
  colors: any;
}

/**
 * Affiche les résultats de recherche organisés par catégories (stations, émissions, listes publiques, communauté),
 * avec des sections dédiées et une indication de type pour les contenus. Gère également l'état vide et les interactions de lecture.
 * @param param0 
 * @returns 
 */
export const SearchResultsView = ({
  stations, users, contents, publicCollections,
  isSearching, query, addToHistory,
  currentTrack, isPlaying, onPlayPress, onLongPress,
  colors,
}: SearchResultsViewProps) => {
  const router = useRouter();
  const totalResults = stations.length + users.length + contents.length + publicCollections.length;

  return (
    <View className="px-6 pt-2">

      {/* Stations */}
      {stations.length > 0 && (
        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <Disc size={18} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
              Stations & Ondes
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {stations.map((item) => (
              <PublicStationCard
                key={item.id}
                item={item}
                onPress={() => {
                  addToHistory(query);
                  router.push(`/brand/${item.brandId ?? item.id}` as any);
                }}
                onPlayPress={onPlayPress}
                onLongPress={onLongPress}
                isPlaying={currentTrack?.id === item.id && isPlaying}
              />
            ))}
          </View>
        </View>
      )}

      {/* Émissions */}
      {contents.length > 0 && (
        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <Radio size={18} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
              Émissions & Diffusions
            </Text>
          </View>
          {contents.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="flex-row items-center p-4 rounded-2xl border mb-3 shadow-sm"
              onPress={() => addToHistory(query)}
            >
              <View style={{ backgroundColor: colors.primary + "22" }} className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                <Radio size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>{item.title}</Text>
                <View className="flex-row items-center mt-1">
                  <View style={{ backgroundColor: colors.primary + "33" }} className="px-2 py-0.5 rounded-full">
                    <Text style={{ color: colors.primary }} className="text-[9px] font-black uppercase tracking-wider">
                      {CONTENT_TYPE_LABEL[item.content_type] ?? item.content_type}
                    </Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={{ color: colors.muted }} className="text-[11px] mt-1" numberOfLines={2}>{item.description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Listes publiques */}
      {publicCollections.length > 0 && (
        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <List size={18} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
              Listes publiques
            </Text>
          </View>
          {publicCollections.map((col) => (
            <TouchableOpacity
              key={col.id}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="flex-row items-center p-4 rounded-2xl border mb-3 shadow-sm"
              onPress={() => router.push(`/collection/${col.id}`)}
            >
              <View style={{ backgroundColor: colors.border }} className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                <List size={20} color={colors.muted} />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>{col.name}</Text>
                {col.description ? (
                  <Text style={{ color: colors.muted }} className="text-[11px] mt-1" numberOfLines={2}>{col.description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Communauté */}
      {users.length > 0 && (
        <View className="mb-10">
          <View className="flex-row items-center mb-6">
            <Users size={18} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-3 text-lg font-black italic tracking-tighter">
              Communauté
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {users.map((u) => (
              <TouchableOpacity
                key={u.id}
                className="items-center mr-8"
                onPress={() => router.push(`/community/user/${u.id}?username=${encodeURIComponent(u.username)}` as any)}
              >
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=222&color=fff` }}
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
  );
};
