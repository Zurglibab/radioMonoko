import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ShieldCheck, KeyRound, Fingerprint, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * SecurityScreen : Centre de contrôle de la confidentialité du compte.
 * Gère le changement de mot de passe et l'authentification biométrique locale.
 */
export default function SecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, securitySettings, updateSecurity, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
    
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * handleToggleBiometry : Gère l'accès aux capteurs biométriques du device.
   * Vérifie la disponibilité du hardware (FaceID/TouchID) avant activation.
   */
  const handleToggleBiometry = async (value: boolean) => {
    if (value) {
      // Vérification de la compatibilité hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(t("profile.security.unavailableTitle"), t("profile.security.unavailableMessage"));
        return;
      }

      // Test d'authentification immédiat pour valider l'activation
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

  /**
   * handlePasswordRequest : Initie la procédure de reset de mot de passe.
   */
  const handlePasswordRequest = () => {
    Alert.alert(
      t("profile.security.changePasswordTitle"),
      t("profile.security.changePasswordMessage", { email: user?.email }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.security.sendCode"),
          onPress: async () => {
             await AuthService.sendResetPasswordEmail(user?.email!);
             router.push("/(auth)/verify-code");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header : Navigation minimaliste */}
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
        
        {/* Illustration de protection */}
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

        {/* Accès & Biométrie */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border mb-6 shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">{t("profile.security.accessSection")}</Text>

          <SecurityOption
            colors={colors}
            icon={KeyRound}
            label={t("profile.security.password.label")}
            secondary={t("profile.security.password.secondary")}
            onPress={handlePasswordRequest}
          />

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

        {/* Note de protection de la vie privée */}
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

/**
 * SecurityOption : Composant de ligne réutilisable pour les réglages de sécurité.
 */
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
    {/* Affiche soit un élément personnalisé (Switch), soit la flèche de navigation par défaut */}
    {rightElement ? rightElement : <ChevronRight size={16} color={colors.muted} />}
  </TouchableOpacity>
);