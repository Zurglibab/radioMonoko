import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Globe, Lock, Trash2, Disc3, Music2, FolderOpen } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { useAuthContext } from "@/context/AuthContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { useCollectionItems } from "@/hooks/collections/useCollectionItems";
import { CollectionService } from "@/services/collections/collection.service";
import { CollectionDTO } from "@/types/collection";

export default function CollectionDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const collectionId = id as string;
  const router = useRouter();
  const { token } = useAuthContext();
  const colors = useThemeColors();

  const { items, isLoading: isItemsLoading, error: itemsError, removeItem } =
    useCollectionItems(collectionId);

  const [collection, setCollection] = useState<CollectionDTO | null>(null);
  const [isHeaderLoading, setIsHeaderLoading] = useState(true);
  const [headerError, setHeaderError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !collectionId) return;
    setIsHeaderLoading(true);
    CollectionService.getById(token, collectionId)
      .then(col => { setCollection(col); setHeaderError(null); })
      .catch(err => {
        if (__DEV__) console.warn("[CollectionDetail] header", err?.message);
        setHeaderError(t('content.collection.notFound'));
      })
      .finally(() => setIsHeaderLoading(false));
  }, [token, collectionId, t]);

  const isLoading = isItemsLoading || isHeaderLoading;
  const error = itemsError || headerError;

  const handleRemove = (contentId: string, title: string) => {
    Alert.alert(
      t('content.collection.removeTitle'),
      t('content.collection.removeMessage', { title }),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('content.collection.removeConfirm'), style: "destructive", onPress: () => removeItem(contentId) },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter flex-1" numberOfLines={1}>
          {collection?.name || t('content.collection.defaultTitle')}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} className="mt-20" />
        ) : error ? (
          <View className="items-center mt-20 px-10">
            <FolderOpen size={48} color={colors.border} />
            <Text style={{ color: colors.muted }} className="mt-4 font-bold italic text-center">
              {error}
            </Text>
          </View>
        ) : (
          <>
            {collection && (
              <View className="px-6 mb-8">
                {collection.description ? (
                  <Text style={{ color: colors.muted }} className="text-sm leading-5 mb-4">
                    {collection.description}
                  </Text>
                ) : null}
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                    className="flex-row items-center px-3 py-1.5 rounded-full border mr-3"
                  >
                    {collection.is_public
                      ? <Globe size={12} color={colors.muted} />
                      : <Lock size={12} color={colors.muted} />
                    }
                    <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase ml-2 tracking-widest">
                      {collection.is_public ? t('common.public') : t('common.private')}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
                    {t('content.collection.itemsCount', { count: items.length })}
                  </Text>
                </View>
              </View>
            )}

            {items.length === 0 ? (
              <View className="items-center mt-16 px-10">
                <View
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="p-8 rounded-[40px] mb-6 border"
                >
                  <Disc3 size={40} color={colors.muted} opacity={0.3} />
                </View>
                <Text style={{ color: colors.text }} className="text-lg font-black italic text-center mb-2">
                  {t('content.collection.emptyTitle')}
                </Text>
                <Text style={{ color: colors.muted }} className="text-sm text-center mb-8 leading-5">
                  {t('content.collection.emptyMessage')}
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: colors.primary }}
                  className="px-8 py-4 rounded-full flex-row items-center"
                  onPress={() => router.push("/(tabs)/search")}
                >
                  <Music2 size={18} color={colors.secondary} />
                  <Text style={{ color: colors.secondary }} className="font-black uppercase text-xs tracking-widest ml-2">
                    {t('content.collection.explore')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="px-6">
                {items.map((item) => {
                  const title = item.content?.title || t('content.collection.untitledWork');
                  return (
                    <View
                      key={item.contentId}
                      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                      className="flex-row items-center mb-4 p-4 rounded-2xl border"
                    >
                      <View
                        style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4 border"
                      >
                        <Disc3 size={20} color={colors.muted} />
                      </View>

                      <View className="flex-1">
                        <Text style={{ color: colors.text }} className="font-bold text-base" numberOfLines={1}>
                          {title}
                        </Text>
                        {item.note ? (
                          <Text style={{ color: colors.muted }} className="text-xs italic mt-0.5" numberOfLines={2}>
                            {t('content.collection.noteQuote', { note: item.note })}
                          </Text>
                        ) : (
                          <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-bold tracking-widest mt-0.5">
                            {item.content?.content_type || "—"}
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => handleRemove(item.contentId, title)}
                        className="p-2.5 active:opacity-50"
                      >
                        <Trash2 size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}