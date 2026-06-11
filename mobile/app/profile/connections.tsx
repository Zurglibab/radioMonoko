import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Users, Lock } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService } from "@/services/social/social.service";
import { Friend } from "@/types/social";

type ConnectionsTab = "followers" | "following";

export default function ConnectionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const { token, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const initialTab = (Array.isArray(params.tab) ? params.tab[0] : params.tab) === "following"
    ? "following"
    : "followers";

  const [activeTab, setActiveTab] = useState<ConnectionsTab>(initialTab);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [following, setFollowing] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      SocialService.fetchMyFollowers(token),
      SocialService.fetchMyFollowing(token),
    ])
      .then(([followersData, followingData]) => {
        if (!isMounted) return;
        setFollowers(Array.isArray(followersData) ? followersData : []);
        setFollowing(Array.isArray(followingData) ? followingData : []);
      })
      .catch(err => {
        if (__DEV__) console.warn("[Connections] Error loading lists:", err?.message);
      })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [token]);

  const items = activeTab === "followers" ? followers : following;

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
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
          {t("profile.connections.title")}
        </Text>
      </View>

      <View
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        className="flex-row mx-6 p-1 rounded-2xl border mb-4"
      >
        <TouchableOpacity
          onPress={() => setActiveTab("followers")}
          style={{ backgroundColor: activeTab === "followers" ? colors.primary : "transparent" }}
          className="flex-1 py-3 rounded-xl items-center"
        >
          <Text
            style={{ color: activeTab === "followers" ? colors.secondary : colors.muted }}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            {t("profile.connections.tabs.followers", { count: followers.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("following")}
          style={{ backgroundColor: activeTab === "following" ? colors.primary : "transparent" }}
          className="flex-1 py-3 rounded-xl items-center"
        >
          <Text
            style={{ color: activeTab === "following" ? colors.secondary : colors.muted }}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            {t("profile.connections.tabs.following", { count: following.length })}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} className="mt-20" />
        ) : items.length === 0 ? (
          <View className="items-center mt-20 px-10">
            <View
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="p-8 rounded-[40px] mb-6 border"
            >
              <Users size={40} color={colors.muted} opacity={0.3} />
            </View>
            <Text style={{ color: colors.text }} className="text-lg font-black italic text-center mb-2">
              {t("profile.connections.emptyTitle")}
            </Text>
            <Text style={{ color: colors.muted }} className="text-sm text-center leading-5">
              {activeTab === "followers"
                ? t("profile.connections.emptyFollowers")
                : t("profile.connections.emptyFollowing")}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="flex-row items-center mb-3 p-4 rounded-2xl border"
              onPress={() => router.push(`/community/user/${item.id}` as any)}
            >
              <View
                style={{ backgroundColor: colors.primary + "22", width: 40, height: 40, borderRadius: 12 }}
                className="items-center justify-center mr-4"
              >
                <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 14 }}>
                  {item.username[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
              <Text style={{ color: colors.text }} className="font-bold text-sm flex-1">
                {item.username}
              </Text>
              {!item.isPublic && <Lock size={14} color={colors.muted} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
