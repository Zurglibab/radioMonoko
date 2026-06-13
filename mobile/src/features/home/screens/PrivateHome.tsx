import React, { useCallback, useMemo, useRef } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Users, ChevronRight } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { User } from "@/types/auth";
import { useMyStatuses } from "@/hooks/content/useMyStatuses";
import { useBrands } from "@/hooks/home/useBrands";
import { useSocialStats } from "@/hooks/social/useSocialStats";
import { useCommunity } from "@/hooks/community/useCommunity";
import { StatCard } from "@/features/home/components/private/StatCard";
import { ActivityCard } from "@/features/home/components/private/ActivityCard";
import { MediaSuggestion } from "@/features/home/components/private/MediaSuggestion";
import { PrivateHeader } from "@/features/home/components/private/PrivateHeader";
import { LibraryQuickNav } from "@/features/home/components/private/LibraryQuickNav";
import { useThemeColors } from "@/utils/useThemeColors";
import { useTranslation } from "react-i18next";

export default function PrivateHome({ user }: { user: User }) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();

  const { statusCounts, isLoading: isStatusesLoading, refetch: refetchStatuses } = useMyStatuses(true);
  const { brands, isLoading: isBrandsLoading, error: brandsError, refetch: refetchBrands } = useBrands(true);
  const { friendsCount, isLoadingSocial, refetch: refetchSocial } = useSocialStats(true);
  const { feed, refetch: refetchFeed } = useCommunity(true);

  const lastRefetchAt = useRef<number>(0);
  const REFETCH_TTL = 30_000;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastRefetchAt.current < REFETCH_TTL) return;
      lastRefetchAt.current = now;

      Promise.all([
        refetchStatuses(),
        refetchBrands(),
        refetchSocial(),
        refetchFeed()
      ]).catch(() => {});
    }, [refetchStatuses, refetchBrands, refetchSocial, refetchFeed])
  );

  const finishedCount = statusCounts.find(s => s.slug === 'finished')?.count || 0;

  const stats = useMemo(() => [
    {
      id: "1",
      label: t('home.privateHome.statListened'),
      value: isStatusesLoading ? "..." : finishedCount.toString(),
      icon: <Clock size={18} color={colors.text} />
    },
    {
      id: "2",
      label: t('home.privateHome.statFollowing'),
      value: isLoadingSocial ? "..." : friendsCount.toString(),
      icon: <Users size={18} color={colors.text} />
    },
  ], [isStatusesLoading, finishedCount, isLoadingSocial, friendsCount, colors.text, t]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <PrivateHeader user={user} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row gap-x-4 px-6 mb-10">
          {stats.map(s => <StatCard key={s.id} {...s} />)}
        </View>

        <LibraryQuickNav />

        <View className="mb-10">
          <Text style={{ color: colors.text }} className="text-xl font-black px-6 mb-6 italic tracking-tighter">
            {t('home.privateHome.todaysDiscoveries')}
          </Text>

          {isBrandsLoading ? (
            <View className="py-6 justify-center items-center">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : brandsError ? (
            <View className="px-6 py-2">
              <Text className="text-red-500 text-xs font-bold">
                {t('home.privateHome.loadStationsError')}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
              {brands.map((station) => (
                <MediaSuggestion key={station.id} item={station} />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="px-6 mb-4">
          <View className="flex-row justify-between items-end mb-6">
            <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
              {t('home.privateHome.networkActivity')}
            </Text>
          </View>

          {feed.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}

          <TouchableOpacity
            className="flex-row items-center justify-center p-6 rounded-[32px] mt-4 border-2 border-dashed"
            style={{ borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.8 }}
            activeOpacity={0.7}
            onPress={() => router.push("/feed")}
          >
            <Text style={{ color: colors.muted }} className="font-black mr-2 uppercase text-[10px] tracking-[2px]">
              {t('home.privateHome.seeFullFeed')}
            </Text>
            <ChevronRight size={14} color={colors.muted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}