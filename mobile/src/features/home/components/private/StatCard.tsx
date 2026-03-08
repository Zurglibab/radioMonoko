import React from "react";
import { View, Text } from "react-native";
import { theme } from "@/constants/theme";

interface StatCardProps {
  label: string;      // Libellé de la statistique
  value: string;      // Valeur affichée de la statistique
  icon: React.ReactNode; // Composant icône
}

/**
 * StatCard : Petit bloc de données analytiques.
 * Utilisé pour afficher les statistiques clés de l'utilisateur (ex: nombre de stations suivies, temps d'écoute, etc.).
 */
export const StatCard = ({ label, value, icon }: StatCardProps) => (
  <View 
    className="flex-1 p-4 rounded-3xl border"
    style={{ 
      backgroundColor: theme.dark.colors.surface, 
      borderColor: theme.dark.colors.border 
    }}
  >
    {/* Conteneur d'icône */}
    <View className="bg-white/10 w-8 h-8 rounded-full items-center justify-center mb-2">
      {icon}
    </View>

    {/* Libellé */}
    <Text 
      style={{ color: theme.dark.colors.muted }} 
      className="text-[10px] uppercase font-bold tracking-widest"
    >
      {label}
    </Text>

    {/* Valeur : L'élément central de la carte */}
    <Text 
      style={{ color: theme.dark.colors.text }} 
      className="text-xl font-bold"
    >
      {value}
    </Text>
  </View>
);