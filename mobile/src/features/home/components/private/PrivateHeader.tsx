import React from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Search, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useAuthContext } from "@/context/AuthContext";

/**
 * PrivateHeader : En-tête personnalisé pour l'espace connecté.
 * Gère l'identité visuelle de l'utilisateur et l'accès rapide aux fonctions globales.
 * @param user - L'objet utilisateur issu de la session active.
 */
export const PrivateHeader = ({ user }: { user: User }) => {
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

  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
      
      {/* SECTION GAUCHE : IDENTITÉ
          Affiche l'avatar (initiale) et le message de bienvenue personnalisé.
      */}
      <View className="flex-row items-center">
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/profile")}
          style={{ 
            backgroundColor: colors.surface, 
            borderColor: colors.border 
          }}
          className="w-11 h-11 rounded-full items-center justify-center border mr-3" 
        >
          <Text style={{ color: colors.text }} className="font-black text-lg uppercase">
            {user.username[0]}
          </Text>
        </TouchableOpacity>
        
        <View>
          <Text 
            style={{ color: colors.muted }} 
            className="text-[9px] font-black uppercase tracking-[2px]"
          >
            Radio Monoco
          </Text>
          <Text 
            style={{ color: colors.text }} 
            className="text-xl font-black tracking-tighter italic"
          >
            Salut, {user.username}
          </Text>
        </View>
      </View>

      {/* SECTION DROITE : ACTIONS RAPIDES
          Boutons circulaires stylisés utilisant les tokens de surface du thème.
      */}
      <View className="flex-row gap-x-3">
        {/* BOUTON RECHERCHE */}
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/search")}
          style={{ 
            backgroundColor: colors.surface, 
            borderColor: colors.border 
          }}
          className="p-2.5 rounded-full border"
          activeOpacity={0.6}
        >
          <Search size={20} color={colors.text} />
        </TouchableOpacity>

        {/* BOUTON NOTIFICATIONS */}
        <TouchableOpacity 
          onPress={() => router.push("/notifications")}
          style={{ 
            backgroundColor: colors.surface, 
            borderColor: colors.border 
          }}
          className="p-2.5 rounded-full border relative"
          activeOpacity={0.6}
        >
          <Bell size={20} color={colors.text} />
          
          {/* INDICATEUR LIVE : Utilise la couleur vibrante du Design System */}
          <View 
            style={{ 
              backgroundColor: colors.live,
              borderColor: colors.surface
            }} 
            className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};