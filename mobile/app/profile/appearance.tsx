import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Moon, Sun, Monitor, LayoutGrid, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * AppearanceScreen : Gestion de l'identité visuelle de l'app.
 * Permet de basculer entre les modes Sombre/Clair, de choisir une couleur 
 * d'accentuation et de modifier la densité de l'interface (Mode Compact).
 */
export default function AppearanceScreen() {
  const router = useRouter();
  const { appearanceSettings, updateAppearance } = useAuthContext();
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

  /**
   * ThemeCard : Composant interne pour les options de mode (Clair/Sombre/Système).
   */
  const ThemeCard = ({ mode, label, icon: Icon }: any) => {
    const isActive = appearanceSettings.themeMode === mode;
    return (
      <TouchableOpacity 
        onPress={() => updateAppearance('themeMode', mode)}
        style={{ 
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border
        }}
        className="items-center justify-center p-4 rounded-[24px] w-[30%] border"
      >
        <Icon size={20} color={isActive ? colors.secondary : colors.muted} />
        <Text 
          style={{ color: isActive ? colors.secondary : colors.muted }}
          className="text-[10px] font-black uppercase mt-2 tracking-widest"
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * ColorCircle : Sélecteur de couleur d'accentuation.
   */
  const ColorCircle = ({ color }: { color: string }) => {
    const isActive = appearanceSettings.accentColor === color;
    return (
      <TouchableOpacity 
        onPress={() => updateAppearance('accentColor', color)}
        style={{ backgroundColor: color, borderColor: colors.background }}
        className="w-10 h-10 rounded-full items-center justify-center border-4"
      >
        {/* On adapte la couleur de la coche selon la luminosité du cercle */}
        {isActive && <Check size={16} color={color === "#FFFFFF" ? "#000000" : "white"} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* HEADER : Retour arrière et Titre stylisé */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
          Apparence
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* SECTION 1 : THÈME (Mode d'affichage) */}
        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          Mode d'affichage
        </Text>
        <View className="flex-row justify-between mb-10">
          <ThemeCard mode="light" label="Clair" icon={Sun} />
          <ThemeCard mode="dark" label="Sombre" icon={Moon} />
          <ThemeCard mode="system" label="Système" icon={Monitor} />
        </View>

        {/* SECTION 2 : COULEUR D'ACCENT (Identité visuelle) */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-6 border mb-6"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] mb-4">
            Couleur d'accent
          </Text>
          <View className="flex-row justify-between">
            <ColorCircle color="#FFFFFF" />
            <ColorCircle color="#FF3B30" />
            <ColorCircle color="#34C759" />
            <ColorCircle color="#FF9500" />
            <ColorCircle color="#007AFF" />
          </View>
        </View>

        {/* SECTION 3 : MISE EN PAGE (Ergonomie) */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">
            Interface
          </Text>
          <View className="flex-row items-center py-5 mx-4">
            <View 
              style={{ backgroundColor: colors.background }} 
              className="w-10 h-10 rounded-xl items-center justify-center"
            >
              <LayoutGrid size={20} color={colors.text} />
            </View>
            <View className="flex-1 ml-4">
              <Text style={{ color: colors.text }} className="font-bold text-sm">Mode Compact</Text>
              <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-black tracking-tighter">
                Afficher plus de contenus
              </Text>
            </View>
            <Switch 
              value={appearanceSettings.isCompactMode} 
              onValueChange={(val) => updateAppearance('isCompactMode', val)}
              trackColor={{ false: colors.border, true: colors.success }} 
              thumbColor={appearanceSettings.isCompactMode ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
        </View>

        {/* MESSAGE DE CONFIRMATION / PHILOSOPHIE DESIGN */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="mt-10 p-6 rounded-[32px] border border-dashed"
        >
          <Text style={{ color: colors.muted }} className="text-[10px] leading-4 text-center italic font-medium">
            L'apparence s'adapte en temps réel pour une immersion totale dans vos ondes préférées.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}