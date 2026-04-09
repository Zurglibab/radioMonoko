import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

interface StatCardProps {
  label: string;       // Libellé de la statistique
  value: string;       // Valeur affichée
  icon: React.ReactNode; // Composant icône Lucide
}

/**
 * StatCard : Petit bloc de données analytiques.
 * Composant réutilisable pour afficher les KPIs de l'utilisateur.
 * S'adapte dynamiquement au Design System pour un aspect Premium.
 */
export const StatCard = ({ label, value, icon }: StatCardProps) => {
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
    <View
      className="flex-1 p-5 rounded-[16px] border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      <View 
        style={{ backgroundColor: colors.background }}
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
      >
        {icon}
      </View>

      {/* LIBELLÉ : Typographie discrète et espacée */}
      <Text
        style={{ color: colors.muted }}
        className="text-[9px] uppercase font-black tracking-[2px] mb-1"
      >
        {label}
      </Text>

      {/* VALEUR : L'élément informatif principal */}
      <Text
        style={{ color: colors.text }}
        className="text-2xl font-black tracking-tighter"
      >
        {value}
      </Text>
    </View>
  );
};