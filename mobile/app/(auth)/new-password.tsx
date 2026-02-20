import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Text, View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
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
      Alert.alert("Désolé", "Une erreur est survenue lors de la réinitialisation.");
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
          title="Nouveau mot de passe" 
          subtitle="Créez un mot de passe robuste pour sécuriser votre accès." 
        />

        <View className="mb-6">
          <AuthInput 
            label="Nouveau mot de passe" 
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
              Réinitialiser
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}