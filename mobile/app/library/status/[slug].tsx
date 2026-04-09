import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, Music2, Mic2, Search } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";
import { useAuthContext } from "@/context/AuthContext";

/**
 * StatusDetailScreen : Affiche une liste filtrée de la bibliothèque (À écouter, En cours, etc.).
 * Utilise le paramètre dynamique 'slug' pour récupérer les médias correspondants.
 */
export default function StatusDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  
  const { getItemsByStatus } = useLibrary();
  const { playTrack } = usePlayer();

  // Détection du thème dynamique (Système, Clair ou Sombre)
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
    
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // Récupération des items filtrés
  const items: Station[] = getItemsByStatus(slug as string);

  // Mapping des titres lisibles
  const titles: Record<string, string> = {
    'to-listen': 'À écouter',
    'in-progress': 'En cours',
    'finished': 'Terminé',
    'dropped': 'Abandonné'
  };

  const currentTitle = titles[slug as string] || "Ma Collection";

  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: colors.background }}
    >
      {/* HEADER : Navigation et Titre Signature */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text 
          style={{ color: colors.text }} 
          className="text-2xl font-black italic tracking-tighter"
        >
          {currentTitle}
        </Text>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {items.length > 0 ? (
          /* SECTION : LISTE DES CONTENUS */
          <View className="px-6 py-4">
            <Text 
              style={{ color: colors.muted }} 
              className="text-[10px] font-black uppercase mb-8 tracking-widest"
            >
              {items.length} contenu{items.length > 1 ? 's' : ''} enregistré{items.length > 1 ? 's' : ''}
            </Text>
            
            {items.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                className="flex-row items-center mb-6"
                onPress={() => playTrack(item)}
                activeOpacity={0.7}
              >
                {/* MINIATURE : Utilise la surface pour le placeholder de chargement */}
                <Image 
                  source={{ uri: item.imageUrl }} 
                  className="w-14 h-14 rounded-2xl mr-4" 
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                />
                
                {/* INFOS MÉDIA */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {item.type === 'radio' ? 
                      <Music2 size={12} color={colors.primary} /> : 
                      <Mic2 size={12} color={colors.muted} />
                    }
                    <Text 
                      style={{ color: colors.muted }} 
                      className="text-[10px] font-black uppercase ml-2 tracking-tighter"
                    >
                      {item.type}
                    </Text>
                  </View>
                  <Text 
                    style={{ color: colors.text }} 
                    className="font-bold text-base" 
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text 
                    style={{ color: colors.muted }} 
                    className="text-xs font-medium"
                  >
                    {item.artist}
                  </Text>
                </View>

                {/* BOUTON PLAY : Discret mais contrasté */}
                <View 
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="p-2.5 rounded-full border"
                >
                  <Play size={14} color={colors.text} fill={colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* EMPTY STATE : Incitation à la découverte */
          <View className="flex-1 items-center justify-center py-40 px-10">
            <View 
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="p-8 rounded-[40px] mb-6 border shadow-sm"
            >
               <Search size={40} color={colors.muted} opacity={0.3} />
            </View>
            <Text 
              style={{ color: colors.text }} 
              className="text-lg font-black italic text-center mb-2"
            >
              C'est encore vide ici
            </Text>
            <Text 
              style={{ color: colors.muted }} 
              className="text-sm text-center mb-10 leading-5"
            >
              Les médias que vous marquerez comme "{currentTitle}" apparaîtront ici pour un accès rapide.
            </Text>
            
            {/* CTA : Bouton d'action principal inversé */}
            <TouchableOpacity 
              style={{ backgroundColor: colors.primary }}
              className="px-8 py-4 rounded-full flex-row items-center shadow-xl"
              onPress={() => router.push("/(tabs)/search")}
            >
              <Search size={18} color={colors.secondary} className="mr-2" />
              <Text 
                style={{ color: colors.secondary }} 
                className="font-black uppercase text-xs tracking-widest"
              >
                Découvrir des ondes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}