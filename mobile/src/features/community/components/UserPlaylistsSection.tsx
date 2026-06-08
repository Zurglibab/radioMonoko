import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ListMusic } from "lucide-react-native";
import { useRouter } from "expo-router";
import { CollectionDTO } from "@/types/collection";

interface UserPlaylistsSectionProps {
  collections: CollectionDTO[];
  colors: any;
}

/**
 * Affiche une section listant les playlists créées par un utilisateur de la communauté,
 * avec un accès rapide à chacune d'elles. Gère également le cas où l'utilisateur n'a créé aucune playlist.
 * @param param0 
 * @returns 
 */
export const UserPlaylistsSection = ({ collections, colors }: UserPlaylistsSectionProps) => {
  const router = useRouter();

  if (collections.length === 0) return null;

  return (
    <View className="w-full mt-8">
      <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px] mb-4">
        Playlists
      </Text>
      {collections.map((col) => (
        <TouchableOpacity
          key={col.id}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="flex-row items-center p-3 rounded-2xl border mb-2"
          onPress={() => router.push(`/playlist/${col.id}` as any)}
        >
          <View
            style={{ backgroundColor: colors.primary + "22", width: 40, height: 40, borderRadius: 12 }}
            className="items-center justify-center mr-3"
          >
            <ListMusic size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>
              {col.name}
            </Text>
            {col.description ? (
              <Text style={{ color: colors.muted }} className="text-xs mt-0.5" numberOfLines={1}>
                {col.description}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
