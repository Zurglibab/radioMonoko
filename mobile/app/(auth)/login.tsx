import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { useAuth } from "@/hooks/auth/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { login, loginWithGoogle, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLoginPress = async () => {
    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView
        className="flex-1 px-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title={t('auth.login.title')}
          subtitle={t('auth.login.subtitle')}
        />

        {error && <AuthErrorBanner message={error} />}

        <View className="mb-2">
          <AuthInput
            label={t('auth.login.emailLabel')}
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            label={t('auth.login.passwordLabel')}
            placeholder={t('auth.login.passwordPlaceholder')}
            isPassword
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <AuthSubmitButton
          label={t('auth.login.submitButton')}
          onPress={onLoginPress}
          isLoading={isLoading}
          className="mt-8"
        />

        <AuthDivider />
        <SocialButtons
          onGooglePress={loginWithGoogle}
          disabled={isLoading}
        />

        <AuthFooterLink
          promptText={t('auth.login.noAccount')}
          actionText={t('auth.login.registerLink')}
          onPress={() => router.push("/(auth)/register")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}