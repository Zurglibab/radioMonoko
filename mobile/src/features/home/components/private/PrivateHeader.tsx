import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Search, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { User } from "@/types/auth";

/**
 * PrivateHeader : En-tête personnalisé pour l'espace connecté.
 * Affiche les informations de l'utilisateur et les actions rapides (recherche, notifications).
 * @param user : L'objet utilisateur issu du contexte global d'authentification.
 */
export const PrivateHeader = ({ user }: { user: User }) => {
  const router = useRouter();

  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
      
      {/*Section de gauche : Identité de l'utilisateur */}
      <View className="flex-row items-center">
        {/* Avatar : Affiche la première lettre de l'username */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/profile")}
          className="w-11 h-11 rounded-full items-center justify-center border mr-3" 
          style={{ 
            backgroundColor: theme.dark.colors.surface, 
            borderColor: theme.dark.colors.border 
          }}
        >
          <Text style={{ color: theme.dark.colors.text }} className="font-bold text-lg uppercase">
            {user.username[0]}
          </Text>
        </TouchableOpacity>
        
        <View>
          {/* Nom de l'app en Micro-Typography */}
          <Text 
            style={{ color: theme.dark.colors.muted }} 
            className="text-[10px] font-bold uppercase tracking-[2px]"
          >
            Radio Monoco
          </Text>
          {/* Message de bienvenue dynamique */}
          <Text 
            style={{ color: theme.dark.colors.text }} 
            className="text-xl font-bold tracking-tighter"
          >
            Salut, {user.username}
          </Text>
        </View>
      </View>

      {/* Section droite : Actions rapides */}
      <View className="flex-row gap-x-3">
        {/* Bouton Recherche : Redirige vers l'onglet dédié à la recherche */}
        <TouchableOpacity 
          onPress={() => router.push("/(tabs)/search")}
          className="p-2.5 rounded-full bg-[#111111] border border-[#222222]"
          activeOpacity={0.6}
        >
          <Search size={20} color="white" />
        </TouchableOpacity>

        {/* Bouton Notifications avec indicateur d'activité */}
        <TouchableOpacity 
          onPress={() => router.push("/notifications")}
          className="p-2.5 rounded-full bg-[#111111] border border-[#222222] relative"
          activeOpacity={0.6}
        >
          <Bell size={20} color="white" />
          
          {/* Indicateur visuel (Petit point) pour signaler du nouveau contenu */}
          <View 
            className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border-2 border-black" 
            style={{ backgroundColor: theme.dark.colors.live }} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};