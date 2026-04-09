import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Scale } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * DocumentScreen : Lecteur de documents légaux (CGU, Confidentialité).
 * Optimisé pour la lecture longue avec une typographie aérée et un design "Paper-Feel".
 */
export default function DocumentScreen() {
  const router = useRouter();
  // Récupération du type de document (cgu ou privacy) via l'URL dynamique
  const { type } = useLocalSearchParams();
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

  // États pour la gestion asynchrone du contenu
  const [data, setData] = useState<{title: string, content: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effet de chargement du document : On appelle le service d'authentification pour récupérer le texte brut.
   * Le service gère la logique de sélection du document selon le type demandé (CGU ou Politique de confidentialité).
   * On stocke le résultat dans l'état local pour l'afficher une fois chargé.
   */
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const doc = await AuthService.getDocumentContent(type as any);
        setData(doc);
      } catch (error) {
        console.error("Erreur chargement document", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDoc();
  }, [type]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Header : Navigation minimaliste et badge officiel */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="p-2 rounded-full border shadow-sm active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View 
          className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border" 
          style={{ borderColor: colors.border }}
        >
           <Scale size={14} color={colors.muted} className="mr-2" />
           <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
             Document Officiel
           </Text>
        </View>
      </View>

      {/* État de chargement */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.muted }} className="mt-4 text-[10px] font-black uppercase tracking-widest">
            Chargement de l'onde légale...
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          // Padding généreux pour que le texte ne touche pas les bords du téléphone
          contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 20, paddingBottom: 100 }}
        >
          {/* Titre éditorial */}
          <Text 
            style={{ color: colors.text }} 
            className="text-4xl font-black italic tracking-tighter leading-[42px] mb-4"
          >
            {data?.title}
          </Text>

          {/* Badge de révision */}
          <View 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="self-start px-4 py-2 rounded-xl border mb-10"
          >
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[1px]">
              Dernière révision : <Text style={{ color: colors.primary }}>Avril 2026</Text>
            </Text>
          </View>
          
          {/* Corps du texte : Paramétré pour une lecture sans effort */}
          <Text 
            style={{ 
              color: colors.text, 
              lineHeight: 28, // Interlignage
              letterSpacing: 0.2
            }} 
            className="text-[15px] font-medium opacity-90"
          >
            {data?.content}
          </Text>

          {/* Footer : Signature finale de l'app */}
          <View 
            style={{ borderColor: colors.border }}
            className="mt-16 pt-8 border-t items-center"
          >
            <Text 
              style={{ color: colors.muted }} 
              className="text-[10px] font-black uppercase tracking-[3px] text-center"
            >
              RadioMonoco • Respect de la vie privée
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}