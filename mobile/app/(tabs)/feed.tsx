import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { PenLine, Newspaper } from "lucide-react-native";
import { useThemeColors } from "@/utils/useThemeColors";
import { getAvatarFallbackUrl } from "@/utils/avatarFallback";
import { useAuthContext } from "@/context/AuthContext";
import { useCommunity } from "@/hooks/community/useCommunity";
import { useRouter } from "expo-router";
import { GuestAccessPrompt } from "@/features/shared/GuestAccessPrompt";
import { FeedCard } from "@/features/community/components/FeedCard";

export default function FeedScreen() {
  const { t } = useTranslation();
  const { token, user } = useAuthContext();
  const colors = useThemeColors();
  const router = useRouter();

  const { feed, isLoading, refetch } = useCommunity();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!token || !user) {
    return (
      <GuestAccessPrompt
        icon={Newspaper}
        title={t('community.feed.guestTitle')}
        message={t('community.feed.guestMessage')}
        colors={colors}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <Text style={{ color: colors.text }} className="text-[20px] font-black italic tracking-tighter">{t('community.feed.title')}</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search" as any)}
          style={{ backgroundColor: colors.primary }}
          className="flex-row items-center px-4 py-2 rounded-full"
        >
          <PenLine size={14} color={colors.background} />
          <Text style={{ color: colors.background }} className="text-xs font-black ml-2 uppercase tracking-wider">{t('community.feed.publish')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/search" as any)}
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderColor: colors.border }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: user?.avatar ?? getAvatarFallbackUrl(user?.username ?? 'Me') }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1 rounded-full px-4 py-2.5 border" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text style={{ color: colors.muted }} className="text-[15px]">{t('community.feed.composerPlaceholder')}</Text>
        </View>
      </TouchableOpacity>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {feed.length === 0 ? (
            <View className="py-24 items-center px-8">
              <Text style={{ color: colors.muted }} className="text-center text-[15px] leading-6">
                {t('community.feed.emptyFeedLine1')}{"\n"}
                <Text style={{ color: colors.primary }}>{t('community.feed.emptyFeedLine2Link')}</Text> {t('community.feed.emptyFeedLine2Suffix')}
              </Text>
            </View>
          ) : (
            feed.map(activity => (
              <FeedCard key={activity.id} activity={activity} />
            ))
          )}
          <View className="h-16" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}