import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { AuthCheckbox } from "@/features/auth/components/AuthCheckbox";
import { useRegister } from "@/hooks/auth/useRegister";

/**
 * RegisterScreen : Écran de création de compte.
 * Gère la saisie des informations utilisateur et l'acceptation des conditions.
 */
export default function RegisterScreen() {
  const router = useRouter();
  
  // Utilisation d'un hook dédié pour isoler la logique d'inscription
  const { register, isLoading, error } = useRegister();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  /**
   * Calcul de l'état du bouton :
   * Je bloque l'action si un chargement est en cours OU si la checkbox n'est pas cochée.
   */
  const isButtonDisabled = isLoading || !agree;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader 
          title="Rejoindre l'onde." 
          subtitle="Créez votre compte pour commencer à partager vos critiques audio sur RadioMonoco." 
        />

        {/* Zone d'affichage des erreurs provenant du backend */}
        {error && (
          <View className="bg-red-500/10 border border-red-500 p-3 rounded-xl mb-6">
            <Text className="text-red-500 text-center font-bold text-sm">{error}</Text>
          </View>
        )}

        <View className="mb-2">
          <AuthInput 
            label="Email" 
            placeholder="votre@email.com" 
            value={email} 
            onChangeText={setEmail}
          />
          <AuthInput 
            label="Mot de passe" 
            placeholder="••••••••" 
            isPassword 
            value={password} 
            onChangeText={setPassword} 
          />
          <AuthInput 
            label="Confirmer le mot de passe" 
            placeholder="••••••••" 
            isPassword 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
          />
        </View>

        {/* Validation des CGU, élément bloquant pour l'inscription */}
        <AuthCheckbox 
          label="J'accepte les conditions d'utilisation" 
          value={agree} 
          onValueChange={setAgree} 
        />

        {/* Bouton d'action avec changement de style dynamique */}
        <TouchableOpacity 
          onPress={() => register(email, password, confirmPassword, agree)}
          disabled={isButtonDisabled}
          className="h-16 rounded-2xl items-center justify-center shadow-lg mt-6"
          style={{ 
            backgroundColor: isButtonDisabled 
              ? theme.dark.colors.surface // Aspect grisé si bloqué
              : theme.dark.colors.primary,
            opacity: isButtonDisabled ? 0.5 : 1 
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.dark.colors.secondary} />
          ) : (
            <Text 
              style={{ 
                color: isButtonDisabled 
                  ? theme.dark.colors.muted 
                  : theme.dark.colors.secondary 
              }} 
              className="font-bold text-lg uppercase tracking-widest"
            >
              S'inscrire
            </Text>
          )}
        </TouchableOpacity>

        {/* Séparateur et options d'inscription sociale */}
        <AuthDivider />
        <SocialButtons />

        {/* Redirection vers le login pour les utilisateurs déjà inscrits */}
        <View className="flex-row justify-center mt-12 mb-6">
          <Text style={{ color: theme.dark.colors.muted }}>Déjà membre ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text 
              style={{ color: theme.dark.colors.text }} 
              className="font-bold underline"
            >
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}