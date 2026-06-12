import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Send, Star, Disc3 } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { useThemeColors } from "@/utils/useThemeColors";
import { BrandService } from "@/services/brand/brand.service";
import { useReviewForm } from "@/hooks/reviews/useReviewForm";
import { Brand } from "@/types/brand";
import { Station } from "@/types/content";

export default function ReviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();

  const [station, setStation] = useState<Brand | null>(null);
  const [isStationLoading, setIsStationLoading] = useState(true);
  const [stationError, setStationError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const stationForHook = useMemo<Station | null>(() => {
    if (!station) return null;
    return {
      id: station.id,
      title: station.title,
      artist: "",
      description: station.description || "",
      imageUrl: "",
      isLive: true,
      category: "Radio",
      type: 'radio',
    };
  }, [station]);

  const { initialRating, isLoadingExisting, isSubmitting, submit } = useReviewForm(stationForHook);

  useEffect(() => {
    if (initialRating > 0) setRating(initialRating);
  }, [initialRating]);

  useEffect(() => {
    if (!id) {
      setStationError(t('library.reviewScreen.noMediaSelected'));
      setIsStationLoading(false);
      return;
    }
    setIsStationLoading(true);
    BrandService.fetchBrandById(id as string)
      .then(brand => {
        setStation(brand);
        setStationError(null);
      })
      .catch(err => {
        if (__DEV__) console.warn("[ReviewScreen]", err?.message);
        setStationError(t('library.reviewScreen.loadMediaError'));
      })
      .finally(() => setIsStationLoading(false));
  }, [id, t]);

  const handlePublish = async () => {
    if (rating === 0) {
      Alert.alert(t('library.reviewScreen.ratingRequiredTitle'), t('library.reviewScreen.ratingRequiredMessage'));
      return;
    }
    if (comment.trim().length < 5) {
      Alert.alert(t('library.reviewScreen.reviewTooShortTitle'), t('library.reviewScreen.reviewTooShortMessage'));
      return;
    }
    try {
      await submit(rating, comment);
      Alert.alert(
        t('library.reviewScreen.publishedTitle'),
        t('library.reviewScreen.publishedMessage'),
        [{ text: t('library.reviewScreen.great'), onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err?.message || t('library.reviewScreen.publishError'));
    }
  };

  const ratingLabel = useMemo(() => {
    const labels = [
      "",
      t('library.reviewScreen.ratingLabels.disappointing'),
      t('library.reviewScreen.ratingLabels.notBad'),
      t('library.reviewScreen.ratingLabels.veryGood'),
      t('library.reviewScreen.ratingLabels.excellent'),
      t('library.reviewScreen.ratingLabels.masterpiece'),
    ];
    return labels[rating];
  }, [rating, t]);

  const isInitializing = isStationLoading || isLoadingExisting;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="p-2 rounded-full border active:opacity-60"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
            {t('library.reviewScreen.headerTitle')}
          </Text>
          <View className="w-10" />
        </View>

        {isInitializing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : stationError || !station ? (
          <View className="flex-1 justify-center items-center px-10">
            <Text style={{ color: colors.muted }} className="text-sm italic text-center">
              {stationError || t('library.reviewScreen.mediaNotFound')}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View
              className="flex-row items-center mt-6 mb-10 p-4 rounded-[16px] border border-dashed"
              style={{ borderColor: colors.border }}
            >
              <View
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="w-12 h-12 rounded-xl items-center justify-center border"
              >
                <Disc3 size={20} color={colors.muted} />
              </View>
              <View className="ml-4 flex-1">
                <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>
                  {station.title}
                </Text>
                <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest" numberOfLines={1}>
                  {station.baseline || t('library.reviewScreen.radioFallback')}
                </Text>
              </View>
            </View>

            {initialRating > 0 && (
              <View
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="px-4 py-3 rounded-2xl border mb-6 flex-row items-center"
              >
                <Star size={14} color={colors.primary} fill={colors.primary} />
                <Text style={{ color: colors.muted }} className="text-xs ml-2 italic">
                  {t('library.reviewScreen.alreadyRated', { rating: initialRating })}
                </Text>
              </View>
            )}

            <View className="items-center mb-10">
              <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[3px] mb-4">
                {t('library.reviewScreen.rateTheWave')}
              </Text>
              <View className="flex-row gap-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Star
                      size={36}
                      color={star <= rating ? colors.primary : colors.muted}
                      fill={star <= rating ? colors.primary : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={{ color: colors.text }} className="mt-4 font-bold italic opacity-60">
                {rating === 0 ? t('library.reviewScreen.chooseIntensity') : t('library.reviewScreen.ratingWithLabel', { rating, label: ratingLabel })}
              </Text>
            </View>

            <View className="mb-8">
              <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[3px] ml-1 mb-2">
                {t('library.reviewScreen.yourOpinion')}
              </Text>
              <TextInput
                multiline
                placeholder={t('library.reviewScreen.commentPlaceholder')}
                placeholderTextColor={colors.muted}
                value={comment}
                onChangeText={setComment}
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text,
                  minHeight: 150,
                  textAlignVertical: 'top'
                }}
                className="w-full p-6 rounded-[32px] border border-white/5 font-medium leading-6"
              />
            </View>

            <TouchableOpacity
              onPress={handlePublish}
              disabled={isSubmitting}
              style={{
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.6 : 1
              }}
              className="w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-lg active:scale-[0.98]"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <>
                  <Send size={18} color={colors.secondary} />
                  <Text style={{ color: colors.secondary }} className="font-black uppercase tracking-[2px] text-xs ml-2">
                    {t('library.reviewScreen.publishReview')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={{ color: colors.muted }} className="text-[10px] text-center mt-6 italic">
              {t('library.reviewScreen.visibilityNotice')}
            </Text>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}