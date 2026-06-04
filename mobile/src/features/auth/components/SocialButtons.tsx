import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import { theme } from "@/constants/theme";

interface SocialButtonsProps {
  onGooglePress: () => void;
  disabled?: boolean;
}

/**
 * SocialButtons : Barre d'authentification tierce (OAuth).
 * Propose une alternative rapide à l'inscription classique par email.
 */
export const SocialButtons = ({ onGooglePress, disabled = false }: SocialButtonsProps) => {
  // Centralisation des configurations des fournisseurs pour faciliter la maintenance
  const providers = [
    { name: 'google', icon: require("@/assets/images/google-icon.png") },
  ];

  return (
    <View className="flex-row justify-center gap-4">
      {providers.map((provider) => (
        <TouchableOpacity 
          key={provider.name} 
          activeOpacity={0.7}
          className="w-full h-16 rounded-2xl items-center justify-center shadow-lg"
          style={{ 
            borderColor: theme.dark.colors.border, 
            backgroundColor: theme.dark.colors.primary, 
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={onGooglePress}
        >
          <Image 
            source={provider.icon} 
            className="w-7 h-7" 
            resizeMode="contain" 
          />
          <Text className="sr-only">
            {`Se connecter avec ${provider.name}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};