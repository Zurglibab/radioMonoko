import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, useColorScheme, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, UserPlus, UserCheck, Users, ListMusic, MoreVertical, MessageSquare } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/community/useUserProfile";
import { ChannelService } from "@/services/chat/channel.service";
import { InitialAvatar } from "@/features/shared/InitialAvatar";
import { UserPlaylistsSection } from "@/features/community/components/UserPlaylistsSection";
import { MutualFriendsSection } from "@/features/community/components/MutualFriendsSection";

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { appearanceSettings, token, user: currentUser } = useAuthContext();
  const systemTheme = useColorScheme();
  const [isChatLoading, setIsChatLoading] = useState(false);

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const {
    id,
    state,
    isLoading,
    error,
    isFollowLoading,
    isBlocking,
    isOwnProfile,
    handleFollowToggle,
    openOptions,
  } = useUserProfile();

  const handleOpenChat = async () => {
    if (!token || !currentUser?.id || !id || isChatLoading) return;
    setIsChatLoading(true);
    try {
      const channelId = await ChannelService.getOrCreateDM(token, currentUser.id, id);
      const displayName = state.profile?.display_name ?? state.profile?.username ?? t('community.userProfile.defaultConversationName');
      router.push(`/chat/${channelId}?username=${encodeURIComponent(displayName)}` as any);
    } catch (err) {
      if (__DEV__) console.warn("[UserProfile] getOrCreateDM failed:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

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
            {error ?? t('community.userProfile.notFound')}
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
          {t('community.userProfile.title')}
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

          <InitialAvatar name={profile.username} size={88} colors={colors} />

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
              { value: targetFriendsCount, label: t('community.userProfile.statsFriends'), icon: <Users size={10} color={colors.muted} /> },
              { value: mutualFriends.length, label: t('community.userProfile.statsMutual'), icon: <Users size={10} color={colors.muted} /> },
              { value: collections.length, label: t('community.userProfile.statsLists'), icon: <ListMusic size={10} color={colors.muted} /> },
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

          {/* Boutons Suivre + Message */}
          {!isOwnProfile && (
            <View className="flex-row mt-5 gap-x-3 w-full">
              <TouchableOpacity
                onPress={handleFollowToggle}
                disabled={isFollowLoading}
                style={{
                  backgroundColor: isFollowing ? colors.surface : colors.text,
                  borderColor: colors.border,
                  opacity: isFollowLoading ? 0.6 : 1,
                }}
                className="flex-1 h-12 rounded-full flex-row items-center justify-center border shadow-sm active:scale-[0.99]"
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color={colors.text} />
                    <Text style={{ color: colors.text }} className="font-black uppercase text-xs ml-2 tracking-widest">
                      {t('community.userProfile.following')}
                    </Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color={colors.background} />
                    <Text style={{ color: colors.background }} className="font-black uppercase text-xs ml-2 tracking-widest">
                      {t('common.follow')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenChat}
                disabled={isChatLoading}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: isChatLoading ? 0.6 : 1,
                }}
                className="h-12 w-12 rounded-full items-center justify-center border shadow-sm active:scale-[0.99]"
              >
                {isChatLoading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <MessageSquare size={18} color={colors.text} />
                )}
              </TouchableOpacity>
            </View>
          )}

          <UserPlaylistsSection collections={collections} colors={colors} />
          <MutualFriendsSection friends={mutualFriends} colors={colors} />
        </View>

        <View className="h-16" />
      </ScrollView>
    </SafeAreaView>
  );
}
