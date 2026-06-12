import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

import { useMyStatuses } from "@/hooks/content/useMyStatuses";
import { useThemeColors } from "@/utils/useThemeColors";
import { MediaRowItem } from "@/features/shared/MediaRowItem";
import { MediaStatus } from "@/types/content";
import { findStatusMeta } from "@/constants/library-status";

const STATUS_KEY_MAP: Record<string, string> = {
  'to-listen': 'toListen',
  'in-progress': 'inProgress',
  'finished': 'finished',
  'dropped': 'dropped',
};

export default function StatusDetailScreen() {
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const colors = useThemeColors();

  const meta = findStatusMeta(slug as MediaStatus);
  const { getByFrontStatus, isLoading, refetch } = useMyStatuses();
  const items = meta ? getByFrontStatus(meta.frontStatus) : [];

  const statusKey = meta ? STATUS_KEY_MAP[meta.frontStatus] : undefined;
  const displayName = statusKey ? t(`library.status.${statusKey}.displayName`) : t('library.statusScreen.unknownStatus');
  const description = statusKey ? t(`library.status.${statusKey}.description`) : "";

  useFocusEffect(useCallback(() => { if (refetch) refetch(); }, [refetch]));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-6 pt-4 mb-6 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="p-2 rounded-full mr-4 border"><ChevronLeft size={20} color={colors.text} /></TouchableOpacity>
        <View className="flex-1">
          <Text style={{ color: colors.text }} className="text-2xl font-black italic tracking-tighter">{displayName}</Text>
          <Text style={{ color: colors.muted }} className="text-xs">{description}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={{ color: colors.muted }} className="text-xs italic">{t('common.loading')}</Text>
        ) : items.length === 0 ? (
          <Text style={{ color: colors.muted }} className="text-xs italic">{t('library.statusScreen.noItems')}</Text>
        ) : (
          items.map((item, index) => (
            <MediaRowItem
              key={`${item.contentId}-${index}`}
              index={index}
              colors={colors}
              item={{
                id: item.contentId,
                title: item.content.title,
                artist: item.content.description || t('library.library.noDescription'),
                description: "",
                imageUrl: "",
                isLive: false,
                category: "",
                type: item.content.content_type === "podcast" ? "podcast" : "radio"
              }}
              subtitle={item.content.description || t('library.library.noDescription')}
              onPress={() => {}}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}