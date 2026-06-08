import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, useColorScheme, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, UserPlus, UserCheck, Users, ListMusic, MoreVertical } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/community/useUserProfile";
import { InitialAvatar } from "@/features/community/components/InitialAvatar";
import { UserPlaylistsSection } from "@/features/community/components/UserPlaylistsSection";
import { MutualFriendsSection } from "@/features/community/components/MutualFriendsSection";

export default function UserProfileScreen() {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const {
    state,
    isLoading,
    error,
    isFollowLoading,
    isBlocking,
    isOwnProfile,
    handleFollowToggle,
    openOptions,
  } = useUserProfile();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !state.profile) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-4">
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ color: colors.muted }} className="text-center font-bold">
            {error ?? "Profil introuvable."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { profile, mutualFriends, targetFriendsCount, collections, isFollowing } = state;
  const displayName = profile.display_name ?? profile.username;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border active:opacity-60"
        >
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-black italic tracking-tighter">
          Profil
        </Text>
        {!isOwnProfile ? (
          <TouchableOpacity
            onPress={openOptions}
            disabled={isBlocking}
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="p-2 rounded-full border active:opacity-60"
          >
            <MoreVertical color={colors.text} size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 items-center mt-4">

          <InitialAvatar username={profile.username} size={88} colors={colors} />

          <Text style={{ color: colors.text }} className="text-2xl font-black mt-5 tracking-tighter">
            {displayName}
          </Text>
          {profile.display_name && (
            <Text style={{ color: colors.muted }} className="text-xs font-bold mt-1">
              @{profile.username}
            </Text>
          )}

          {/* Compteurs */}
          <View
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="flex-row mt-6 rounded-2xl border overflow-hidden"
          >
            {[
              { value: targetFriendsCount, label: "Amis", icon: <Users size={10} color={colors.muted} /> },
              { value: mutualFriends.length, label: "En commun", icon: <Users size={10} color={colors.muted} /> },
              { value: collections.length, label: "Listes", icon: <ListMusic size={10} color={colors.muted} /> },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={{ width: 1, backgroundColor: colors.border }} />}
                <View className="flex-1 items-center py-4 px-4">
                  <Text style={{ color: colors.text }} className="text-xl font-black">{stat.value}</Text>
                  <View className="flex-row items-center mt-1">
                    {stat.icon}
                    <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-wider ml-1">
                      {stat.label}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Bouton Suivre */}
          {!isOwnProfile && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              disabled={isFollowLoading}
              style={{
                backgroundColor: isFollowing ? colors.surface : colors.text,
                borderColor: colors.border,
                opacity: isFollowLoading ? 0.6 : 1,
              }}
              className="w-full h-12 rounded-full flex-row items-center justify-center border shadow-sm mt-5 active:scale-[0.99]"
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} color={colors.text} />
                  <Text style={{ color: colors.text }} className="font-black uppercase text-xs ml-2 tracking-widest">
                    Abonné
                  </Text>
                </>
              ) : (
                <>
                  <UserPlus size={16} color={colors.background} />
                  <Text style={{ color: colors.background }} className="font-black uppercase text-xs ml-2 tracking-widest">
                    Suivre
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <UserPlaylistsSection collections={collections} colors={colors} />
          <MutualFriendsSection friends={mutualFriends} colors={colors} />
        </View>

        <View className="h-16" />
      </ScrollView>
    </SafeAreaView>
  );
}
