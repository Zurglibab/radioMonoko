import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Search } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useRouter } from "expo-router";

/**
 * HomeHeader : L'en-tête de la page d'accueil.
 * Conçu pour donner une impression de grandeur et d'exploration dès l'ouverture.
 * Utilise une hiérarchie visuelle marquée entre le titre d'appel et le slogan.
 */
export const HomeHeader = () => {
  const router = useRouter();
  
  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-8">
      {/* Appel à l'action : "Découvrir" */}
      <View>
        <Text 
          style={{ color: theme.dark.colors.text }} 
          className="text-3xl font-black tracking-tighter"
        >
          Découvrir
        </Text>
        <Text 
          style={{ color: theme.dark.colors.muted }} 
          className="text-xs font-bold uppercase tracking-widest mt-1"
        >
          Le monde à votre écoute
        </Text>
      </View>

      {/* Action de recherche au moteur de la communauté */}
      <TouchableOpacity 
        activeOpacity={0.7}
        className="p-3 rounded-2xl border" 
        style={{ 
          backgroundColor: theme.dark.colors.surface, 
          borderColor: theme.dark.colors.border 
        }}
        onPress={() => router.push("/(tabs)/search")}
      >
        <Search size={22} color={theme.dark.colors.text} />
      </TouchableOpacity>
    </View>
  );
};