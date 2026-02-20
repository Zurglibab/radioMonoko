import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { theme } from "@/constants/theme";

/**
 * SocialButtons : Barre d'authentification tierce (OAuth).
 * Propose une alternative rapide à l'inscription classique par email.
 */
export const SocialButtons = () => {
  // Centralisation des configurations des fournisseurs pour faciliter la maintenance
  const providers = [
    { name: 'google', icon: require("@/assets/images/google-icon.png") },
    { name: 'apple', icon: require("@/assets/images/apple-icon.png") },
    { name: 'facebook', icon: require("@/assets/images/facebook-icon.png") },
  ];

  return (
    <View className="flex-row justify-center gap-4">
      {providers.map((provider) => (
        <TouchableOpacity 
          key={provider.name} 
          activeOpacity={0.7}
          className="w-16 h-16 rounded-full border items-center justify-center"
          style={{ 
            borderColor: theme.dark.colors.border, 
            backgroundColor: theme.dark.colors.surface,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => {
            console.log(`Authentification avec ${provider.name}`);
          }}
        >
          <Image 
            source={provider.icon} 
            className="w-7 h-7" 
            resizeMode="contain" 
            // Je force l'icône Apple en blanc pour le thème sombre
            style={provider.name === 'apple' ? { tintColor: 'white' } : {}}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};