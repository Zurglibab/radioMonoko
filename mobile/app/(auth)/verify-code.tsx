import React, { useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { AuthService } from "@/services/auth/auth.service";

/**
 * VerifyCodeScreen - Écran de validation du code OTP (One-Time Password).
 * Cette étape assure que l'utilisateur possède bien l'accès à l'email renseigné.
 */
export default function VerifyCodeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Le code est géré sous forme de tableau pour faciliter la liaison avec les 6 inputs individuels
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Gestion du compte à rebours pour le renvoi du code.
   * J'utilise un intervalle pour mettre à jour l'UI chaque seconde.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Nettoyage de l'intervalle au démontage pour éviter les fuites de mémoire
    return () => clearInterval(interval);
  }, []);

  /**
   * Vérification du code saisi.
   */
  const handleVerify = async () => {
    // On fusionne le tableau ['1','2'...] en une chaîne "123456" avant l'envoi
    const fullCode = code.join("");
    
    if (fullCode.length < 6) {
      Alert.alert(t('auth.verifyCode.incompleteAlertTitle'), t('auth.verifyCode.incompleteAlertMessage'));
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.verifyOtpCode(fullCode);

      // Une fois vérifié, je remplace l'écran actuel par la création du nouveau mot de passe
      router.replace("/(auth)/new-password");
    } catch (e) {
      Alert.alert(t('auth.verifyCode.errorAlertTitle'), t('auth.verifyCode.errorAlertMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView 
        className="flex-1 px-8" 
        contentContainerStyle={{ paddingTop: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title={t('auth.verifyCode.title')}
          subtitle={t('auth.verifyCode.subtitle')}
        />

        <OtpInput code={code} setCode={setCode} />

        {/* Feedback du timer */}
        <View className="items-center mb-8">
          <Text style={{ color: theme.dark.colors.muted }}>
            {t('auth.verifyCode.resendCode', { timer })}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleVerify}
          disabled={isLoading}
          className="h-16 rounded-2xl items-center justify-center shadow-lg"
          style={{ 
            backgroundColor: theme.dark.colors.primary,
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.dark.colors.secondary} />
          ) : (
            <Text
              className="font-bold text-lg uppercase tracking-widest"
              style={{ color: theme.dark.colors.secondary }}
            >
              {t('auth.verifyCode.submitButton')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}