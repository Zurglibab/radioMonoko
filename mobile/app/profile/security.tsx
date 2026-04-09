import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ShieldCheck, KeyRound, Smartphone, Fingerprint, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * SecurityScreen : Centre de contrôle de la confidentialité du compte.
 * Gère le changement de mot de passe, l'authentification biométrique locale
 * et la double authentification (2FA).
 */
export default function SecurityScreen() {
  const router = useRouter();
  const { user, securitySettings, updateSecurity, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

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
   * handleToggle2FA : Active/Désactive la double authentification.
   * Communique avec le serveur pour mettre à jour le statut du compte.
   */
  const handleToggle2FA = async (value: boolean) => {
    setIsLoading(true);
    try {
      await AuthService.toggleTwoFactor(value);
      await updateSecurity('is2FAEnabled', value);
      Alert.alert("Sécurité", value ? "Double authentification activée." : "Double authentification désactivée.");
    } catch (e) {
      Alert.alert("Erreur", "Impossible de modifier ce paramètre.");
    } finally {
      setIsLoading(false);
    }
  };

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
        Alert.alert("Indisponible", "Votre appareil ne supporte pas la biométrie ou aucun profil n'est enregistré.");
        return;
      }

      // Test d'authentification immédiat pour valider l'activation
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmez votre identité pour RadioMonoko",
        fallbackLabel: "Utiliser le code de l'appareil",
      });

      if (result.success) {
        await updateSecurity('isBiometricEnabled', true);
        Alert.alert("Succès", "Biométrie activée pour vos prochaines connexions.");
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
      "Modifier le mot de passe",
      "Nous allons envoyer un code de vérification sécurisé sur l'adresse : " + user?.email,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Envoyer le code", 
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
          Sécurité
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* Illustration de protection */}
        <View className="items-center mb-10">
          <View 
            className="w-20 h-20 rounded-[32px] items-center justify-center border shadow-xl"
            style={{ 
              backgroundColor: securitySettings.is2FAEnabled ? colors.success + '15' : colors.live + '15',
              borderColor: securitySettings.is2FAEnabled ? colors.success : colors.live
            }}
          >
            <ShieldCheck size={40} color={securitySettings.is2FAEnabled ? colors.success : colors.live} />
          </View>
          <Text style={{ color: colors.text }} className="font-black mt-4 text-lg italic tracking-tighter text-center">
              Protection : {securitySettings.is2FAEnabled ? "Maximum" : "Standard"}
          </Text>
        </View>

        {/* Accès & Biométrie */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border mb-6 shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">Accès & Biométrie</Text>
          
          <SecurityOption 
            colors={colors}
            icon={KeyRound} 
            label="Mot de passe" 
            secondary="Modifier via email de sécurité"
            onPress={handlePasswordRequest}
          />
          
          <SecurityOption 
            colors={colors}
            icon={Fingerprint} 
            label="Face ID / Touch ID" 
            secondary="Connexion rapide et sécurisée"
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

        {/* Authentification avancée */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">Authentification</Text>
          
          <SecurityOption 
            colors={colors}
            icon={Smartphone} 
            label="Double facteur (2FA)" 
            secondary="Vérification par code unique (OTP)"
            isLast={true}
            rightElement={
              <Switch 
                value={securitySettings.is2FAEnabled} 
                onValueChange={handleToggle2FA}
                trackColor={{ false: colors.border, true: colors.live + '80' }}
                thumbColor={securitySettings.is2FAEnabled ? colors.live : (isDark ? "#444" : "#F4F3F4")}
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
            RadioMonoco utilise un cryptage de bout en bout pour protéger vos données de session et vos préférences de diffusion.
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