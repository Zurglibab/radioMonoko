import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { theme } from "@/constants/theme";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { SocialButtons } from "@/features/auth/components/SocialButtons";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { useAuth } from "@/hooks/auth/useAuth";

/**
 * LoginScreen : Écran d'authentification par email/mot de passe.
 * Utilise le hook 'useAuth' pour séparer la logique métier (API/Validation) de la couche de présentation.
 */
export default function LoginScreen() {
  const router = useRouter();
  
  // J'extrait les états et méthodes nécessaires depuis notre hook d'authentification
  const { login, isLoading, error } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Déclenche la procédure de connexion.
   * La gestion des erreurs et du stockage du token est déléguée au hook 'useAuth'.
   */
  const onLoginPress = async () => {
    await login(email, password);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView 
        className="flex-1 px-8" 
        showsVerticalScrollIndicator={false}
        // On assure un padding confortable pour éviter que le contenu ne colle aux bords sur petit écran
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête de page */}
        <AuthHeader 
          title="Bon retour." 
          subtitle="Entrez vos identifiants pour accéder à l'onde RadioMonoco." 
        />

        {/* Feedback d'erreur*/}
        {error && (
          <View className="bg-red-500/10 border border-red-500 p-4 rounded-xl mb-6">
            <Text className="text-red-500 text-center font-bold text-sm">
              {error}
            </Text>
          </View>
        )}

        {/* Formulaire de saisie */}
        <View className="mb-2">
          <AuthInput 
            label="Email" 
            placeholder="utilisateur@example.com" 
            value={email} 
            onChangeText={setEmail}
          />
          <AuthInput 
            label="Mot de passe" 
            placeholder="••••••••" 
            isPassword // Masque la saisie
            value={password} 
            onChangeText={setPassword} 
          />
        </View>

        {/* Lien vers la récupération de mot de passe */}
        <TouchableOpacity 
          onPress={() => router.push("/(auth)/forgot-password")}
          activeOpacity={0.7}
          className="items-end mb-10"
        >
          <Text 
            style={{ color: theme.dark.colors.muted }} 
            className="text-sm font-semibold"
          >
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>

        {/* Action de connexion */}
        <TouchableOpacity 
          onPress={onLoginPress}
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
              className="font-bold text-lg uppercase tracking-widest"
            >
              Se connecter
            </Text>
          )}
        </TouchableOpacity>

        {/* Connexion via réseaux sociaux */}
        <AuthDivider />
        <SocialButtons />

        {/* Navigation vers l'inscription */}
        <View className="flex-row justify-center mt-12 mb-6">
          <Text style={{ color: theme.dark.colors.muted }}>Nouveau sur RadioMonoco ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text 
               style={{ color: theme.dark.colors.text }} 
               className="font-bold underline"
            >
              S'inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}