import { theme } from "@/constants/theme";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Library,
  Search,
  User,
  Newspaper,
} from "lucide-react-native";
import React from "react";
import { Platform, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthContext } from "@/context/AuthContext";

/**
 * TabsLayout : Structure de navigation principale par onglets.
 * Gère l'apparence de la TabBar et l'adaptation aux différentes tailles d'écran.
 */
export default function TabsLayout() {
  // Récupération des préférences d'apparence de l'utilisateur
  const { appearanceSettings } = useAuthContext();

  // Détection du thème système pour le mode "system"
  const systemTheme = useColorScheme();
  
  // Récupération des zones sécurisées pour éviter les conflits avec les éléments système (notch, barre de navigation)
  const insets = useSafeAreaInsets();

  // Détermination du thème sombre en fonction des préférences de l'utilisateur et du système
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';

  // Utilisation du thème dark par défaut pour la barre de navigation
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // Couleur d'accent dynamique selon les préférences de l'utilisateur
  const activeColor = appearanceSettings.accentColor;
  
  // Calcul dynamique de la hauteur pour garantir un rendu parfait sur tous les devices
  const baseHeight = 58;
  const bottom = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // J'utilise nos propres headers personnalisés

        // Couleurs dynamiques selon l'état de l'onglet
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.muted,

        // Style de la barre de navigation
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: baseHeight + bottom,
          paddingBottom: bottom, // Protection contre la zone de balayage système
          paddingTop: 8,
          elevation: 8, // Ombre portée pour Android
        },

        // Style du texte sous les icônes
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          // Ajustement optique spécifique à iOS pour l'alignement
          marginTop: Platform.OS === "ios" ? 2 : 0,
        },

        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {/* Onglet Accueil */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />

      {/* Onglet Flux */}
      <Tabs.Screen
        name="feed"
        options={{
          title: "Flux",
          tabBarIcon: ({ color }) => <Newspaper size={22} color={color} />,
        }}
      />

      {/* Onglet Recherche */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />

      {/* Onglet Bibliothèque / Ma Radio */}
      <Tabs.Screen
        name="library"
        options={{
          title: "Ma radio",
          tabBarIcon: ({ color }) => <Library size={22} color={color} />,
        }}
      />

      {/* Onglet Profil Utilisateur */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}