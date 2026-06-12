import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Radio, Waves, Play, Pause, MoreHorizontal } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { useAuthContext } from "@/context/AuthContext";
import { BrandService } from "@/services/brand/brand.service";
import { Brand } from "@/types/brand";
import { Station } from "@/types/content";
import { usePlayer } from "@/context/PlayerContext";
import { mapBrandToStation, mapWebRadioToStation } from "@/utils/mappers/brand.mapper";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { usePromptLogin } from "@/features/shared/usePromptLogin";
import { InitialAvatar } from "@/features/shared/InitialAvatar";

export default function BrandDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuthContext();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const promptLogin = usePromptLogin();
  const colors = useThemeColors();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    BrandService.fetchBrandById(id)
      .then(setBrand)
      .catch(() => setError(t('content.brand.notFound')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !brand) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center px-6 py-4">
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ color: colors.muted }} className="text-center font-bold">
            {error ?? t('content.brand.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const brandStation = mapBrandToStation(brand);
  const subStations = [
    ...(brand.webRadios ?? []),
    ...(brand.localRadios ?? []),
  ];

  const isBrandPlaying = currentTrack?.id === brandStation.id && isPlaying;

  const openSheet = (station: Station) => {
    // Gérer une onde (favoris, statut, collections) nécessite un compte
    if (!token || !user) {
      promptLogin(t('common.guestAccess.manageStationAction'));
      return;
    }
    setSelectedStation(station);
    setIsSheetVisible(true);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border active:opacity-60"
        >
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-black italic ml-4 tracking-tighter">
          {t('content.brand.headerTitle')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View className="px-6 mt-2 mb-8 items-center">
          <InitialAvatar name={brand.title} size={96} colors={colors} />

          <Text style={{ color: colors.text }} className="text-2xl font-black mt-5 tracking-tighter text-center">
            {brand.title}
          </Text>

          {brand.baseline ? (
            <Text style={{ color: colors.muted }} className="text-xs font-bold uppercase tracking-widest mt-2 text-center">
              {brand.baseline}
            </Text>
          ) : null}

          {/* Badges */}
          <View className="flex-row mt-4 gap-x-3">
            {brand.liveStream ? (
              <View style={{ backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }}
                className="flex-row items-center px-3 py-1 rounded-full border">
                <Waves size={10} color={colors.primary} />
                <Text style={{ color: colors.primary }} className="text-[9px] font-black ml-1 uppercase tracking-wider">
                  {t('content.brand.liveAvailable')}
                </Text>
              </View>
            ) : null}
            {subStations.length > 0 ? (
              <View style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="flex-row items-center px-3 py-1 rounded-full border">
                <Radio size={10} color={colors.muted} />
                <Text style={{ color: colors.muted }} className="text-[9px] font-black ml-1 uppercase tracking-wider">
                  {t('content.brand.subStationsCount', { count: subStations.length })}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {brand.description ? (
            <Text style={{ color: colors.text }} className="text-sm leading-6 mt-6 text-center opacity-70 px-2">
              {brand.description}
            </Text>
          ) : null}

          {/* Bouton écouter le direct + actions */}
          {brand.liveStream ? (
            <View className="flex-row mt-6 w-full" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => playTrack(brandStation)}
                style={{ backgroundColor: isBrandPlaying ? colors.primary : colors.text, flex: 1 }}
                className="flex-row items-center justify-center h-12 rounded-full shadow-sm active:scale-[0.98]"
              >
                {isBrandPlaying ? (
                  <Pause size={14} color={colors.background} fill={colors.background} />
                ) : (
                  <Play size={14} color={colors.background} fill={colors.background} />
                )}
                <Text style={{ color: colors.background }} className="font-black uppercase text-xs ml-2 tracking-widest">
                  {isBrandPlaying ? t('content.brand.nowPlaying') : t('content.brand.listenLive')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openSheet(brandStation)}
                style={{ backgroundColor: colors.surface, borderColor: colors.border, width: 48, height: 48 }}
                className="rounded-full border items-center justify-center shadow-sm active:opacity-60"
              >
                <MoreHorizontal size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Sous-stations */}
        {subStations.length > 0 && (
          <View className="px-6 mb-10">
            <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px] mb-5">
              {t('content.brand.subStations')}
            </Text>
            {subStations.map((wr) => {
              const wrStation = mapWebRadioToStation(wr, brand);
              const isWrPlaying = currentTrack?.id === wrStation.id && isPlaying;
              return (
                <View
                  key={wr.id}
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="flex-row items-center p-4 rounded-2xl border mb-3 shadow-sm"
                >
                  <InitialAvatar name={wr.title} size={44} colors={colors} />
                  <View className="flex-1 ml-4">
                    <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>
                      {wr.title}
                    </Text>
                    {wr.description ? (
                      <Text style={{ color: colors.muted }} className="text-[11px] mt-0.5" numberOfLines={2}>
                        {wr.description}
                      </Text>
                    ) : null}
                  </View>
                  {wr.liveStream ? (
                    <View className="flex-row items-center ml-3" style={{ gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => openSheet(wrStation)}
                        style={{ backgroundColor: colors.border }}
                        className="p-2 rounded-full active:opacity-60"
                      >
                        <MoreHorizontal size={14} color={colors.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => playTrack(wrStation)}
                        style={{ backgroundColor: isWrPlaying ? colors.primary : colors.primary + "22" }}
                        className="p-2 rounded-full active:scale-95"
                      >
                        {isWrPlaying ? (
                          <Pause size={14} color={colors.background} fill={colors.background} />
                        ) : (
                          <Play size={14} color={colors.primary} fill={colors.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <View className="h-10" />
      </ScrollView>

      <MediaActionSheet
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        station={selectedStation}
      />
    </SafeAreaView>
  );
}
