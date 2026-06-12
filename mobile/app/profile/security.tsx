import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ShieldCheck, Fingerprint, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

export default function SecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { securitySettings, updateSecurity, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const handleToggleBiometry = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(t("profile.security.unavailableTitle"), t("profile.security.unavailableMessage"));
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("profile.security.confirmIdentityPrompt"),
        fallbackLabel: t("profile.security.fallbackLabel"),
      });

      if (result.success) {
        await updateSecurity('isBiometricEnabled', true);
        Alert.alert(t("profile.security.biometryEnabledTitle"), t("profile.security.biometryEnabledMessage"));
      }
    } else {
      await updateSecurity('isBiometricEnabled', false);
    }
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
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
          {t("profile.security.headerTitle")}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-10">
          <View
            className="w-20 h-20 rounded-[32px] items-center justify-center border shadow-xl"
            style={{
              backgroundColor: securitySettings.isBiometricEnabled ? colors.success + '15' : colors.live + '15',
              borderColor: securitySettings.isBiometricEnabled ? colors.success : colors.live
            }}
          >
            <ShieldCheck size={40} color={securitySettings.isBiometricEnabled ? colors.success : colors.live} />
          </View>
          <Text style={{ color: colors.text }} className="font-black mt-4 text-lg italic tracking-tighter text-center">
              {t("profile.security.protectionLabel", { status: securitySettings.isBiometricEnabled ? t("profile.security.protectionEnhanced") : t("profile.security.protectionStandard") })}
          </Text>
        </View>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border mb-6 shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">{t("profile.security.accessSection")}</Text>

          <SecurityOption
            colors={colors}
            icon={Fingerprint}
            label={t("profile.security.biometry.label")}
            secondary={t("profile.security.biometry.secondary")}
            isLast={true}
            rightElement={
              <Switch 
                value={securitySettings.isBiometricEnabled} 
                onValueChange={handleToggleBiometry}
                trackColor={{ false: colors.border, true: colors.live + '80' }} 
                thumbColor={securitySettings.isBiometricEnabled ? colors.live : (isDark ? "#444" : "#F4F3F4")}
              />
            }
          />
        </View>

        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="mt-10 p-6 rounded-[32px] border border-dashed"
        >
          <Text style={{ color: colors.muted }} className="text-[10px] leading-4 text-center italic font-medium">
            {t("profile.security.privacyNote")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SecurityOption = ({ icon: Icon, label, secondary, rightElement, onPress, isLast, colors }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={{ borderBottomColor: colors.border }}
    className={`flex-row items-center py-5 mx-4 ${!isLast ? 'border-b' : ''}`}
  >
    <View style={{ backgroundColor: colors.background }} className="w-10 h-10 rounded-xl items-center justify-center">
      <Icon size={20} color={colors.text} />
    </View>
    <View className="flex-1 ml-4">
      <Text style={{ color: colors.text }} className="font-bold text-sm">{label}</Text>
      <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-black tracking-tighter">{secondary}</Text>
    </View>
    {rightElement ? rightElement : <ChevronRight size={16} color={colors.muted} />}
  </TouchableOpacity>
);