import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Mail, MessageSquare, Globe, ChevronRight, Activity, Bug } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * SupportScreen : Centre d'assistance pour les utilisateurs.
 * Regroupe les contacts directs, le signalement de bugs et l'état des services.
 * Conçu pour offrir un accès rapide aux solutions en cas de problème technique.
 */
export default function SupportScreen() {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

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
   * MenuItem : Composant interne pour uniformiser les entrées du menu support.
   */
  const MenuItem = ({ icon: Icon, label, secondary, onPress, isLast = false, iconColor }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center py-5 mx-4 ${!isLast ? 'border-b' : ''}`}
      style={{ borderBottomColor: colors.border }}
    >
      {/* Container d'icône avec fond contrasté */}
      <View 
        style={{ backgroundColor: colors.background }} 
        className="w-10 h-10 rounded-2xl items-center justify-center"
      >
        <Icon size={20} color={iconColor || colors.text} />
      </View>

      {/* Libellés et informations secondaires */}
      <View className="flex-1 ml-4">
        <Text style={{ color: colors.text }} className="font-bold text-sm tracking-tight">
          {label}
        </Text>
        {secondary && (
          <Text style={{ color: colors.muted }} className="text-[9px] uppercase font-black tracking-widest mt-0.5">
            {secondary}
          </Text>
        )}
      </View>
      <ChevronRight size={16} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Header : Navigation retour et titre épuré */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="p-2 rounded-full border shadow-sm active:opacity-60" 
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text 
          style={{ color: colors.text }} 
          className="text-xl font-black italic tracking-tighter ml-4"
        >
          Assistance
        </Text>
      </View>

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* Aide directe et documentation */}
        <Text 
          style={{ color: colors.muted }} 
          className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4"
        >
          Besoin d'aide ?
        </Text>
        
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="rounded-[16px] p-2 border mb-8 shadow-sm"
        >
          <MenuItem 
            icon={Globe} 
            label="Centre d'aide" 
            secondary="FAQ & Tutoriels"
            onPress={() => router.push("/profile/help-center")}
          />
          <MenuItem 
            icon={Mail} 
            label="Envoyer un email" 
            secondary="Réponse sous 24h"
            onPress={() => Linking.openURL('mailto:hello@radiomonoko.com')} 
          />
          <MenuItem 
            icon={Bug} 
            label="Signaler un bug" 
            secondary="Aidez-nous à nous améliorer"
            isLast={true}
            onPress={() => Alert.alert("Bug Report", "Merci de nous aider à améliorer l'onde RadioMonoko.")}
          />
        </View>

        {/* Communauté et état technique */}
        <Text 
          style={{ color: colors.muted }} 
          className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4"
        >
          Réseau & État
        </Text>
        
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="rounded-[16px] p-2 border shadow-sm"
        >
          <MenuItem 
            icon={MessageSquare} 
            label="Communauté Discord" 
            secondary="Échangez avec les curateurs"
            onPress={() => Alert.alert("Lien", "Redirection vers Discord...")} 
          />
          <MenuItem 
            icon={Activity} 
            label="État des services" 
            secondary="Systèmes opérationnels"
            // Feedback visuel : vert si tout va bien
            iconColor={isDark ? theme.dark.colors.success : "#10B981"}
            onPress={() => Alert.alert("Status", "Tous les systèmes sont opérationnels.")}
            isLast={true}
          />
        </View>

        {/* Footer : Versionning discret */}
        <View className="mt-12 mb-8 items-center">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[2px] opacity-50">
            RadioMonoco Support v1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}