import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * HelpCenterScreen : Centre de ressources (FAQ) pour les utilisateurs.
 * Organise les réponses par catégories extensibles (accordéons) pour une lecture fluide.
 */
export default function HelpCenterScreen() {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
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
  
  // États pour la gestion de la FAQ et de l'affichage
  const [faq, setFaq] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Chargement de la FAQ :
   * Récupère la liste des questions/réponses depuis le service d'authentification.
   */
  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const data = await AuthService.getFaq();
        setFaq(data as any[]);
      } catch (error) {
        console.error("Erreur chargement FAQ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaq();
  }, []);

  /**
   * FaqItem : Composant interne gérant l'état ouvert/fermé de chaque question.
   */
  const FaqItem = ({ item, index }: any) => {
    const isExpanded = expandedIndex === index;
    return (
      <View 
        style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
        className="mb-4 rounded-[16px] border overflow-hidden shadow-sm"
      >
        {/* En-tête de la question (cliquable) */}
        <TouchableOpacity 
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          activeOpacity={0.7}
          className="flex-row items-center justify-between p-6"
        >
          <Text style={{ color: colors.text }} className="font-bold text-sm flex-1 mr-4 tracking-tight">
            {item.q}
          </Text>
          <View style={{ backgroundColor: colors.background }} className="p-1 rounded-full">
            {isExpanded ? (
              <ChevronUp size={16} color={colors.primary} />
            ) : (
              <ChevronDown size={16} color={colors.muted} />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Zone de réponse (affichée conditionnellement) */}
        {isExpanded && (
          <View className="px-6 pb-6 pt-0">
            {/* Petit séparateur subtil */}
            <View style={{ backgroundColor: colors.border }} className="h-[1px] w-full mb-4 opacity-50" />
            <Text style={{ color: colors.muted }} className="text-xs leading-5 font-medium">
              {item.a}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header : Bouton retour et titre compact */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="p-2 rounded-full border shadow-sm active:opacity-60" 
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text 
          style={{ color: colors.text }} 
          className="text-xl font-black italic tracking-tighter ml-4"
        >
          Centre d'aide
        </Text>
      </View>

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>
        {/* Section Hero : Phrase d'accueil éditoriale */}
        <View className="mb-10 px-2">
          <Text 
            style={{ color: colors.text }} 
            className="text-3xl font-black italic tracking-tighter leading-[32px]"
          >
            Comment pouvons-nous{"\n"}vous aider ?
          </Text>
          <Text style={{ color: colors.muted }} className="text-sm mt-3 font-medium opacity-80">
            Retrouvez les réponses aux questions les plus fréquentes de la communauté.
          </Text>
        </View>

        {/* Contenu : Loader ou Liste d'accordéons */}
        {isLoading ? (
          <View className="mt-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          faq.map((item, index) => (
            <FaqItem key={index} item={item} index={index} />
          ))
        )}

        {/* Footer : Rebond vers le support direct si la FAQ ne suffit pas */}
        <View 
          className="mt-8 mb-16 p-8 rounded-[16px] items-center border" 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text 
            style={{ color: colors.text }} 
            className="font-bold text-center tracking-tight"
          >
            Vous ne trouvez pas votre bonheur ?
          </Text>
          <Text style={{ color: colors.muted }} className="text-xs text-center mt-1 mb-6">
            Nos équipes sont là pour vous guider.
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="px-10 py-4 rounded-full shadow-lg active:opacity-90" 
            style={{ backgroundColor: colors.primary }}
          >
            <Text 
              style={{ color: colors.secondary }} 
              className="font-black uppercase text-[10px] tracking-[2px]"
            >
              Contacter le support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}