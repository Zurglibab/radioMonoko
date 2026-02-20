import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthService } from "@/services/auth/auth.service";

/**
 * ForgotPasswordScreen : Premier écran du flux de récupération de compte.
 * Permet à l'utilisateur de demander un code de réinitialisation via son adresse email.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // États locaux pour la gestion du formulaire et du feedback visuel
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Envoi du mail de récupération.
   * Je gère un état de chargement pour éviter les doubles clics accidentels.
   */
  const handleSend = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      // Appel au service d'authentification pour déclencher l'envoi du mail
      await AuthService.sendResetPasswordEmail(email);
      
      // Navigation vers l'étape de vérification du code reçu
      router.push("/(auth)/verify-code");
    } catch (error) {
      console.error("Erreur envoi email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.dark.colors.background }}>
      <ScrollView 
        className="px-8" 
        contentContainerStyle={{ paddingTop: 40 }}
        keyboardShouldPersistTaps="handled" // Permet de cliquer sur le bouton même si le clavier est ouvert
      >
        <AuthHeader 
          title="Mot de passe oublié" 
          subtitle="Pas d'inquiétude, entrez votre email pour recevoir un code de réinitialisation." 
        />

        <AuthInput label="Email" placeholder="votre@email.com" value={email} onChangeText={setEmail} />

        <TouchableOpacity 
          onPress={handleSend}
          disabled={isLoading} // Désactive le bouton pendant le chargement
          className="h-16 rounded-2xl items-center justify-center mt-6"
          style={{ 
            backgroundColor: theme.dark.colors.primary,
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <Text 
            className="font-bold text-black" 
            style={{ color: theme.dark.colors.secondary }}
          >
            {isLoading ? "ENVOI EN COURS..." : "ENVOYER LE CODE"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}