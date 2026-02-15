import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from "@/constants/theme";

interface Props {
  label: string;          // Libellé au-dessus du champ
  placeholder: string;    // Texte d'exemple à l'intérieur
  isPassword?: boolean;   // Définit si c'est un champ sécurisé
  value: string;          // Valeur contrôlée
  onChangeText: (text: string) => void; // Callback de mise à jour
}

/**
 * AuthInput : Champ de saisie personnalisé pour le flux d'authentification.
 * Gère automatiquement l'affichage conditionnel de l'icône de visibilité pour les champs de type mot de passe.
 */
export const AuthInput = ({ label, placeholder, isPassword, value, onChangeText }: Props) => {
  // État local pour basculer entre le mode masqué et visible du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-5">
      {/* Label du champ */}
      <Text 
        style={{ color: theme.dark.colors.muted }} 
        className="text-sm mb-2 font-medium"
      >
        {label}
      </Text>

      <View
        className="flex-row items-center border rounded-xl px-4 h-14"
        style={{ 
          backgroundColor: theme.dark.colors.surface, 
          borderColor: theme.dark.colors.border 
        }}
      >
        <TextInput
          className="flex-1 text-base"
          style={{ color: theme.dark.colors.text }}
          placeholder={placeholder}
          placeholderTextColor={theme.dark.colors.muted}
          // Si c'est un mot de passe, on cache le texte sauf si showPassword est vrai
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onChangeText={onChangeText}
          // Je désactive la majuscule automatique par défaut pour les champs d'authentification
          autoCapitalize="none"
          // Améliore l'accessibilité et la prédiction du clavier
          autoCorrect={false}
        />

        {/* Bouton pour afficher/masquer le mot de passe, rendu uniquement si isPassword est true */}
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Augmente la zone de clic sans changer le layout
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.dark.colors.muted} />
            ) : (
              <Eye size={20} color={theme.dark.colors.muted} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};