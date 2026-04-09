import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, FileText, Download, ShieldCheck, Trash2, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * LegalScreen : Gestion de la conformité RGPD et des documents officiels.
 * Centralise les CGU, la politique de confidentialité, l'export et la suppression des données.
 */
export default function LegalScreen() {
  const router = useRouter();
  const { user, logout, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  // États locaux pour gérer le retour visuel pendant les appels API longs
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
   * Export des données : Conformément au RGPD, les utilisateurs peuvent demander une archive
   * contenant toutes leurs données personnelles et d'activité. 
   * Un email de confirmation est envoyé une fois l'archive prête.
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await AuthService.exportUserData(user?.email || "");
      Alert.alert(
        "Demande enregistrée", 
        "Conformément au RGPD, votre archive est en cours de préparation. Vous recevrez un lien de téléchargement sur votre email sous 24h."
      );
    } catch (e) {
      Alert.alert("Erreur", "Impossible de générer l'export. Réessayez plus tard.");
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Droit à l'oubli : Suppression définitive du compte utilisateur.
   * Cette action est irréversible et supprime toutes les données associées.
   * Une double confirmation est requise pour éviter les erreurs de manipulation.
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte ?",
      "Cette action est irréversible. Toutes vos playlists, favoris et paramètres seront définitivement effacés.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer définitivement", 
          style: "destructive", 
          onPress: async () => {
            setIsDeleting(true);
            try {
              await AuthService.deleteAccount();
              await logout();
              // Redirection vers l'accueil public après destruction de la session
              router.replace("/(auth)/welcome");
            } catch (e) {
              Alert.alert("Erreur", "Une erreur est survenue lors de la suppression.");
            } finally {
              setIsDeleting(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Header : Navigation et Titre iconique */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="p-2 rounded-full border shadow-sm active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic ml-4 tracking-tighter">
          Légal
        </Text>
      </View>

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* Documents officiels */}
        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          Documents
        </Text>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[16px] p-2 border mb-8 shadow-sm">
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/profile/document", params: { type: 'cgu' } })}
            className="flex-row items-center py-5 mx-4 border-b" 
            style={{ borderBottomColor: colors.border }}
          >
            <FileText size={20} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-4 font-bold flex-1 text-sm">Conditions Générales (CGU)</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center py-5 mx-4"
            onPress={() => router.push({ pathname: "/profile/document", params: { type: 'privacy' } })}
          >
            <ShieldCheck size={20} color={colors.text} />
            <Text style={{ color: colors.text }} className="ml-4 font-bold flex-1 text-sm">Politique de Confidentialité</Text>
            <ChevronRight size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Portabilité des données */}
        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          Portabilité
        </Text>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[16px] p-6 border mb-8 shadow-sm">
          <Text style={{ color: colors.text }} className="font-black text-lg mb-2 italic tracking-tighter">Export Archive</Text>
          <Text style={{ color: colors.muted }} className="text-xs mb-6 leading-5 font-medium">
            Téléchargez l'intégralité de votre activité RadioMonoco (historique, préférences, métadonnées).
          </Text>
          
          <TouchableOpacity 
            onPress={handleExport}
            disabled={isExporting}
            style={{ backgroundColor: colors.primary }}
            className="h-14 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
          >
            {isExporting ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <>
                <Download size={18} color={colors.secondary} />
                <Text style={{ color: colors.secondary }} className="font-black uppercase text-[10px] ml-2 tracking-[2px]">Générer l'archive</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Zone de danger */}
        <Text style={{ color: colors.live }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          Zone de danger
        </Text>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[16px] p-6 border mb-10 shadow-sm">
          <Text style={{ color: colors.text }} className="font-black text-lg mb-2 italic tracking-tighter">Droit à l'oubli</Text>
          <Text style={{ color: colors.muted }} className="text-xs mb-6 leading-5 font-medium">
            Supprimez définitivement votre compte et toutes les données associées de nos serveurs.
          </Text>
          
          <TouchableOpacity 
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            className="h-14 rounded-2xl flex-row items-center justify-center border-2 active:bg-red-500/10"
            style={{ borderColor: colors.live }}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.live} />
            ) : (
              <>
                <Trash2 size={18} color={colors.live} />
                <Text style={{ color: colors.live }} className="font-black uppercase text-[10px] ml-2 tracking-[2px]">Supprimer le compte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer : Versionning de l'application */}
        <Text className="text-center mb-10 text-[9px] uppercase font-black tracking-[2px] opacity-40" style={{ color: colors.muted }}>
          RadioMonoco v1.0.0 • 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}