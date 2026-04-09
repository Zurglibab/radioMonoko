import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Users } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * CommunitySection : Liste horizontale des membres actifs.
 * Encourage la découverte sociale et le "follow" entre utilisateurs.
 * @param onPrompt : Callback pour déclencher une action (ex: ouvrir une modale de suggestion).
 */
export const CommunitySection = ({ onPrompt }: { onPrompt: (msg: string) => void }) => {
  const { appearanceSettings } = useAuthContext();
  const isDark = appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  return (
    <View className="mb-12">
    {/* En-tête de la section */}
    <View className="flex-row items-center px-6 mb-5">
      <Users size={18} color={colors.muted} className="mr-2" />
      <Text className="text-white text-lg font-bold italic tracking-tight">
        Communauté
      </Text>
    </View>

    {/* Liste des membres actifs */}
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={{ paddingHorizontal: 24 }}
    >
      {['Shérine', 'Tristan', 'Kilian', 'Aurélien', 'Romain'].map((name, i) => (
        <TouchableOpacity 
          key={i} 
          className="items-center mr-8" 
          onPress={() => onPrompt("suivre des utilisateurs")}
          activeOpacity={0.7}
        >
          {/* Cercle des avatars */}
          <View 
            className="w-16 h-16 rounded-full border-2 p-1 mb-2 items-center justify-center" 
            style={{ borderColor: colors.border }}
          >
            <View className="w-full h-full rounded-full bg-white/10 items-center justify-center border border-white/5">
              <Text 
                style={{ color: colors.text }} 
                className="font-bold text-base uppercase"
              >
                {name[0]}
              </Text>
            </View>
          </View>

          {/* Arobase des membres */}
          <Text 
            style={{ color: colors.muted }} 
            className="text-[10px] font-bold tracking-tight"
          >
            @{name.toLowerCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
  );
};