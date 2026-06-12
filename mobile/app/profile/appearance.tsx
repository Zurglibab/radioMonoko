import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Sun, Monitor, LayoutGrid, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";

export default function AppearanceScreen() {
  const { t } = useTranslation();
  const { appearanceSettings, updateAppearance, languageSettings, updateLanguage } = useAuthContext();
  const colors = useThemeColors();

  const ThemeCard = ({ mode, label, icon: Icon }: any) => {
    const isActive = appearanceSettings.themeMode === mode;
    return (
      <TouchableOpacity 
        onPress={() => updateAppearance('themeMode', mode)}
        style={{ 
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border
        }}
        className="items-center justify-center p-4 rounded-[24px] w-[30%] border"
      >
        <Icon size={20} color={isActive ? colors.secondary : colors.muted} />
        <Text 
          style={{ color: isActive ? colors.secondary : colors.muted }}
          className="text-[10px] font-black uppercase mt-2 tracking-widest"
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const LanguageCard = ({ lang, label, flag }: { lang: 'fr' | 'en'; label: string; flag: string }) => {
    const isActive = languageSettings.language === lang;
    return (
      <TouchableOpacity
        onPress={() => updateLanguage(lang)}
        style={{
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border
        }}
        className="items-center justify-center p-4 rounded-[24px] w-[48%] border"
      >
        <Text className="text-2xl mb-1">{flag}</Text>
        <Text
          style={{ color: isActive ? colors.secondary : colors.muted }}
          className="text-[10px] font-black uppercase mt-1 tracking-widest"
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const ColorCircle = ({ color }: { color: string }) => {
    const isActive = appearanceSettings.accentColor === color;
    return (
      <TouchableOpacity
        onPress={() => updateAppearance('accentColor', color)}
        style={{ backgroundColor: color, borderColor: colors.background }}
        className="w-10 h-10 rounded-full items-center justify-center border-4"
      >
        {isActive && <Check size={16} color={color === "#FFFFFF" ? "#000000" : "white"} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ProfileHeader title={t('profile.appearance.title')} colors={colors} />

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          {t('profile.appearance.displayMode')}
        </Text>
        <View className="flex-row justify-between mb-10">
          <ThemeCard mode="light" label={t('profile.appearance.light')} icon={Sun} />
          <ThemeCard mode="dark" label={t('profile.appearance.dark')} icon={Moon} />
          <ThemeCard mode="system" label={t('profile.appearance.system')} icon={Monitor} />
        </View>

        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          {t('profile.appearance.languageSection')}
        </Text>
        <View className="flex-row justify-between mb-10">
          <LanguageCard lang="fr" label={t('profile.appearance.french')} flag="🇫🇷" />
          <LanguageCard lang="en" label={t('profile.appearance.english')} flag="🇬🇧" />
        </View>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-6 border mb-6"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mb-4">
            {t('profile.appearance.accentColor')}
          </Text>
          <View className="flex-row justify-between">
            <ColorCircle color="#FFFFFF" />
            <ColorCircle color="#FF3B30" />
            <ColorCircle color="#34C759" />
            <ColorCircle color="#FF9500" />
            <ColorCircle color="#007AFF" />
          </View>
        </View>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">
            {t('profile.appearance.interface')}
          </Text>
          <View className="flex-row items-center py-5 mx-4">
            <View
              style={{ backgroundColor: colors.background }}
              className="w-10 h-10 rounded-xl items-center justify-center"
            >
              <LayoutGrid size={20} color={colors.text} />
            </View>
            <View className="flex-1 ml-4">
              <Text style={{ color: colors.text }} className="font-bold text-sm">{t('profile.appearance.compactMode')}</Text>
              <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-black tracking-tighter">
                {t('profile.appearance.compactModeDesc')}
              </Text>
            </View>
            <Switch
              value={appearanceSettings.isCompactMode}
              onValueChange={(val) => updateAppearance('isCompactMode', val)}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={appearanceSettings.isCompactMode ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
        </View>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="mt-10 p-6 rounded-[32px] border border-dashed"
        >
          <Text style={{ color: colors.muted }} className="text-[10px] leading-4 text-center italic font-medium">
            {t('profile.appearance.philosophy')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}