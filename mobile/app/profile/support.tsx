import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Bug, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";

export default function SupportScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();

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
      <ProfileHeader title={t("profile.support.headerTitle")} colors={colors} />

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>
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

        <View className="mt-4 mb-8 items-center">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[2px] opacity-50">
            {t("profile.support.footer")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
