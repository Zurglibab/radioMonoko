import React from "react";
import { View, Text, Image } from "react-native";
import { theme } from "@/constants/theme";

interface Props {
  title: string;    // Titre principal
  subtitle: string; // Texte d'accompagnement ou explicatif
}

/**
 * AuthHeader : En-tête standardisé pour le flux d'authentification.
 * Centralise le logo et la typographie des titres pour garantir une cohérence visuelle sur tous les écrans (Login, Register, etc.).
 */
export const AuthHeader = ({ title, subtitle }: Props) => (
  <View className="items-center mb-12">
    {/* Logo de l'application placé en haut*/}
    <Image 
      source={require("@/assets/images/logo/logo.png")} 
      style={{ width: 160, height: 70 }}
      resizeMode="contain"
      className="mb-10"
    />

    {/* Titre de l'écran qui utilise une taille généreuse pour une hiérarchie claire */}
    <Text 
      className="text-4xl font-bold mb-3 text-center" 
      style={{ color: theme.dark.colors.text }}
    >
      {title}
    </Text>

    {/* Sous-titre du texte informatif utilisant une couleur plus douce (muted). */}
    <Text 
      style={{ color: theme.dark.colors.muted }} 
      className="text-base px-4 text-center leading-6"
    >
      {subtitle}
    </Text>
  </View>
);