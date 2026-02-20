import React from "react";
import { View, Text } from "react-native";
import { theme } from "@/constants/theme";

/**
 * AuthDivider : Séparateur visuel horizontal.
 * Utilisé pour distinguer graphiquement les différentes méthodes d'authentification dans les écrans de connexion et d'inscription.
 */
export const AuthDivider = () => (
  <View className="flex-row items-center my-12">
    {/* Ligne de gauche : utilise flex-1 pour occuper tout l'espace disponible */}
    <View 
      className="flex-1 h-[0.5px]" 
      style={{ backgroundColor: theme.dark.colors.muted }} 
    />

    {/* Texte central : "OU" pour indiquer l'alternative */}
    <Text 
      className="mx-6 font-bold text-[10px] tracking-widest uppercase" 
      style={{ color: theme.dark.colors.muted }}
    >
      OU
    </Text>

    {/* Ligne de droite : identique à celle de gauche pour une symétrie parfaite */}
    <View 
      className="flex-1 h-[0.5px]" 
      style={{ backgroundColor: theme.dark.colors.muted }} 
    />
  </View>
);