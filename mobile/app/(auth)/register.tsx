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
import { AuthCheckbox } from "@/features/auth/components/AuthCheckbox";
import { AuthErrorBanner } from "@/features/auth/components/AuthErrorBanner";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";
import { AuthFooterLink } from "@/features/auth/components/AuthFooterLink";
import { useRegister } from "@/hooks/auth/useRegister";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { register, registerWithGoogle, isLoading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader
          title={t('auth.register.title')}
          subtitle={t('auth.register.subtitle')}
        />

        {error && <AuthErrorBanner message={error} />}

        <View className="mb-2">
          <AuthInput
            label={t('auth.register.emailLabel')}
            placeholder={t('auth.register.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            label={t('auth.register.usernameLabel')}
            placeholder={t('auth.register.usernamePlaceholder')}
            value={username}
            onChangeText={setUsername}
          />
          <AuthInput
            label={t('auth.register.passwordLabel')}
            placeholder={t('auth.register.passwordPlaceholder')}
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <AuthInput
            label={t('auth.register.confirmPasswordLabel')}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <AuthCheckbox
          label={t('auth.register.agreeToTerms')}
          value={agree}
          onValueChange={setAgree}
        />

        <AuthSubmitButton
          label={t('auth.register.submitButton')}
          onPress={() => register(email, password, confirmPassword, username, agree)}
          isLoading={isLoading}
          disabled={!agree}
          className="mt-6"
        />

        <AuthDivider />
        <SocialButtons
          onGooglePress={registerWithGoogle}
          disabled={isLoading}
        />

        <AuthFooterLink
          promptText={t('auth.register.alreadyMember')}
          actionText={t('auth.register.loginLink')}
          onPress={() => router.push("/(auth)/login")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}