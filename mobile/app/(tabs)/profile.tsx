import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LogOut, ShieldCheck, CircleHelp,
  User, Paintbrush, FileText,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { usePendingRequests } from "@/hooks/profile/usePendingRequests";
import { PendingRequestsSection } from "@/features/profile/components/PendingRequestsSection";
import { SettingItem } from "@/features/profile/components/SettingItem";

const StatBox = ({ label, value, colors }: { label: string; value: number | string; colors: any }) => (
  <View
    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    className="items-center justify-center p-5 rounded-[16px] w-[31%] border"
  >
    <Text style={{ color: colors.text }} className="text-2xl font-black italic tracking-tighter">{value}</Text>
    <Text style={{ color: colors.muted }} className="text-[8px] uppercase font-black tracking-widest mt-1">{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, favorites, playlists, statusItems } = useLibrary();
  const { token, logout, appearanceSettings } = useAuthContext();
  const router = useRouter();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const { requests, isLoading: pendingLoading, respondingId, accept, refuse } = usePendingRequests(token);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language === "en" ? "en-US" : "fr-FR", { month: "long", year: "numeric" })
    : null;

  const handleLogout = () => {
    Alert.alert(t("profile.profileTab.logoutConfirmTitle"), t("profile.profileTab.logoutConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.logout"), style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      <View className="px-6 pb-2">
        <View className="mt-6">
          <Text style={{ color: colors.text }} className="text-3xl font-black italic tracking-tighter">{t("profile.profileTab.title")}</Text>
        </View>

        <View className="items-center mt-8">
          <View className="relative">
            <Image
              source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=333&color=fff` }}
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="w-32 h-32 rounded-[40px] border-2"
            />
            <View
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 items-center justify-center"
              style={{ backgroundColor: colors.primary, borderColor: colors.background }}
            >
              <User size={12} color={colors.secondary} />
            </View>
          </View>

          <Text style={{ color: colors.text }} className="text-3xl font-black mt-6 tracking-tighter">{user.display_name || user.username}</Text>
          {!!user.display_name && (
            <Text style={{ color: colors.muted }} className="font-bold text-xs mt-1">@{user.username}</Text>
          )}
          <Text style={{ color: colors.muted }} className="font-bold mb-3 uppercase text-[10px] tracking-[2px] mt-1">{user.email}</Text>

          <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="px-6 py-2 rounded-full border">
            <Text style={{ color: colors.muted }} className="text-[11px] font-medium">
              {memberSince ? t("profile.profileTab.memberSince", { date: memberSince }) : "Radio Monoko"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-10">
          <StatBox colors={colors} label={t("profile.profileTab.stats.waves")} value={favorites.length} />
          <StatBox colors={colors} label={t("profile.profileTab.stats.playlists")} value={playlists.length} />
          <StatBox colors={colors} label={t("profile.profileTab.stats.finished")} value={statusItems.find((i) => i.slug === "finished")?.count ?? 0} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6 mt-4">
        <PendingRequestsSection
          requests={requests}
          isLoading={pendingLoading}
          respondingId={respondingId}
          onAccept={accept}
          onRefuse={refuse}
          colors={colors}
        />

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-8 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">{t("profile.profileTab.accountSection")}</Text>
          <SettingItem icon={User} label={t("profile.profileTab.editProfile.label")} secondary={t("profile.profileTab.editProfile.secondary")} onPress={() => router.push("/profile/edit")} colors={colors} />
          <SettingItem icon={ShieldCheck} label={t("profile.profileTab.security.label")} secondary={t("profile.profileTab.security.secondary")} onPress={() => router.push("/profile/security")} isLast colors={colors} />
        </View>

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-6 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">{t("profile.profileTab.experienceSection")}</Text>
          <SettingItem icon={Paintbrush} label={t("profile.profileTab.appearance.label")} secondary={t("profile.profileTab.appearance.secondary")} onPress={() => router.push("/profile/appearance")} isLast colors={colors} />
        </View>

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-6 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">{t("profile.profileTab.supportSection")}</Text>
          <SettingItem icon={CircleHelp} label={t("profile.profileTab.support.label")} secondary={t("profile.profileTab.support.secondary")} onPress={() => router.push("/profile/support")} colors={colors} />
          <SettingItem icon={FileText} label={t("profile.profileTab.legal.label")} secondary={t("profile.profileTab.legal.secondary")} onPress={() => router.push("/profile/legal")} isLast colors={colors} />
        </View>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} className="flex-row items-center justify-center py-10 mb-10">
          <LogOut size={18} color={colors.primary} />
          <Text style={{ color: colors.primary }} className="ml-3 font-black uppercase text-xs tracking-[3px]">{t("profile.profileTab.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
