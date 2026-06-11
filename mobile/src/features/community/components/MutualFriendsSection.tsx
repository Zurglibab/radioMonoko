import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Friend } from "@/types/social";

interface MutualFriendsSectionProps {
  friends: Friend[];
  colors: any;
}

/**
 * Affiche une section listant les amis en commun avec un utilisateur de la communauté,
 * avec un accès rapide à leur profil. Affiche jusqu'à 5 amis en commun, et gère le cas où il n'y en a aucun.
 * @param param0 
 * @returns 
 */
export const MutualFriendsSection = ({ friends, colors }: MutualFriendsSectionProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  if (friends.length === 0) return null;

  return (
    <View className="w-full mt-8">
      <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px] mb-4">
        {t('community.mutualFriends.title')}
      </Text>
      {friends.slice(0, 5).map((f) => (
        <TouchableOpacity
          key={f.id}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="flex-row items-center p-3 rounded-2xl border mb-2"
          onPress={() => router.push(`/community/user/${f.id}` as any)}
        >
          <View
            style={{ backgroundColor: colors.primary + "22", width: 36, height: 36, borderRadius: 10 }}
            className="items-center justify-center mr-3"
          >
            <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 13 }}>
              {f.username[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            {f.username}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
