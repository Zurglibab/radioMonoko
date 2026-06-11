import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Mail, Bug, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * SupportScreen : Centre d'assistance pour les utilisateurs.
 * Donne accès au contact direct par email et au signalement de bugs.
 */
export default function SupportScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * MenuItem : Composant interne pour uniformiser les entrées du menu support.
   */
  const MenuItem = ({ icon: Icon, label, secondary, onPress, isLast = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center py-5 mx-4 ${!isLast ? 'border-b' : ''}`}
      style={{ borderBottomColor: colors.border }}
    >
      <View
        style={{ backgroundColor: colors.background }}
        className="w-10 h-10 rounded-2xl items-center justify-center"
      >
        <Icon size={20} color={colors.text} />
      </View>

      <View className="flex-1 ml-4">
        <Text style={{ color: colors.text }} className="font-bold text-sm tracking-tight">
          {label}
        </Text>
        {secondary && (
          <Text style={{ color: colors.muted }} className="text-[9px] uppercase font-black tracking-widest mt-0.5">
            {secondary}
          </Text>
        )}
      </View>
      <ChevronRight size={16} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      {/* Header : Navigation retour et titre épuré */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border shadow-sm active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{ color: colors.text }}
          className="text-xl font-black italic tracking-tighter ml-4"
        >
          {t("profile.support.headerTitle")}
        </Text>
      </View>

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>

        {/* Aide directe */}
        <Text
          style={{ color: colors.muted }}
          className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4"
        >
          {t("profile.support.needHelpSection")}
        </Text>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[16px] p-2 border mb-8 shadow-sm"
        >
          <MenuItem
            icon={Mail}
            label={t("profile.support.email.label")}
            secondary={t("profile.support.email.secondary")}
            onPress={() => Linking.openURL('mailto:hello@radiomonoko.com')}
          />
          <MenuItem
            icon={Bug}
            label={t("profile.support.bug.label")}
            secondary={t("profile.support.bug.secondary")}
            isLast={true}
            onPress={() => Linking.openURL('mailto:hello@radiomonoko.com?subject=Signalement%20de%20bug%20-%20RadioMonoko')}
          />
        </View>

        {/* Footer : Versionning discret */}
        <View className="mt-4 mb-8 items-center">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[2px] opacity-50">
            {t("profile.support.footer")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
