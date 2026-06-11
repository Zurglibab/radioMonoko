import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthService } from "@/services/auth/auth.service";

/**
 * NewPasswordScreen : Étape finale de la récupération de compte.
 * Permet de définir un nouveau mot de passe après validation du code reçu par mail.
 */
export default function NewPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // États pour les champs de saisie et la gestion du chargement
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Traitement de la réinitialisation.
   * J'effectue une validation locale avant d'interroger le serveur.
   */
  const handleReset = async () => {
    // Sécurité de vérification de correspondance des champs
    if (password !== confirmPassword) {
      Alert.alert(t('auth.newPassword.mismatchAlertTitle'), t('auth.newPassword.mismatchAlertMessage'));
      return;
    }

    setIsLoading(true);
    try {
      // Appel du service pour mettre à jour le mot de passe en base
      await AuthService.resetPassword(password);

      // J'utilise replace au lieu de push pour vider l'historique de navigation
      // et empêcher l'utilisateur de revenir en arrière sur ce flux terminé.
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert(t('auth.newPassword.errorAlertTitle'), t('auth.newPassword.errorAlertMessage'));
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
          title={t('auth.newPassword.title')}
          subtitle={t('auth.newPassword.subtitle')}
        />

        <View className="mb-6">
          <AuthInput
            label={t('auth.newPassword.passwordLabel')}
            placeholder={t('auth.newPassword.passwordPlaceholder')}
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <AuthInput
            label={t('auth.newPassword.confirmPasswordLabel')}
            placeholder={t('auth.newPassword.confirmPasswordPlaceholder')}
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Bouton d'action principale */}
        <TouchableOpacity 
          onPress={handleReset}
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
              style={{ color: theme.dark.colors.secondary }}
              className="font-bold uppercase tracking-widest text-lg"
            >
              {t('auth.newPassword.submitButton')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}