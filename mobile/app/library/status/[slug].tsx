import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Play, Music2, Mic2, Search } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { usePlayer } from "@/context/PlayerContext";
import { Station } from "@/types/content";

/**
 * StatusDetailScreen : Affiche une liste filtrée de la bibliothèque.
 * Utilise le paramètre dynamique 'slug' pour récupérer les bons médias.
 */
export default function StatusDetailScreen() {
  // Récupération du paramètre d'URL (ex: /library/status/in-progress)
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  
  const { getItemsByStatus } = useLibrary();
  const { playTrack } = usePlayer();

  // On récupère les items correspondants au statut actuel
  const items: Station[] = getItemsByStatus(slug as string);

  // Mapping des slugs techniques vers des titres lisibles par l'humain
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
      style={{ backgroundColor: theme.dark.colors.background }}
    >
      {/* Header : Navigation retour et Titre dynamique */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mr-4 active:opacity-60"
        >
          <ChevronLeft size={28} color={theme.dark.colors.text} />
        </TouchableOpacity>
        <Text 
          style={{ color: theme.dark.colors.text }} 
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
          /* Affichage des contenus trouvés */
          <View className="px-6 py-4">
            <Text 
              style={{ color: theme.dark.colors.muted }} 
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
                {/* Miniature de l'onde */}
                <Image 
                  source={{ uri: item.imageUrl }} 
                  className="w-14 h-14 rounded-2xl mr-4" 
                  style={{ backgroundColor: theme.dark.colors.surface }}
                />
                
                {/* Infos Média */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    {item.type === 'radio' ? 
                      <Music2 size={12} color={theme.dark.colors.primary} /> : 
                      <Mic2 size={12} color={theme.dark.colors.muted} />
                    }
                    <Text 
                      style={{ color: theme.dark.colors.muted }} 
                      className="text-[10px] font-bold uppercase ml-2 tracking-tighter"
                    >
                      {item.type}
                    </Text>
                  </View>
                  <Text 
                    style={{ color: theme.dark.colors.text }} 
                    className="font-bold text-base" 
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text 
                    style={{ color: theme.dark.colors.muted }} 
                    className="text-xs font-medium"
                  >
                    {item.artist}
                  </Text>
                </View>

                {/* Bouton Play discret */}
                <View className="bg-white/10 p-2 rounded-full border border-white/5">
                  <Play size={14} color={theme.dark.colors.text} fill={theme.dark.colors.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Empty state : UX optimisée pour encourager l'exploration */
          <View className="flex-1 items-center justify-center py-40 px-10">
            <View className="bg-white/5 p-8 rounded-[40px] mb-6">
               <Search size={40} color={theme.dark.colors.muted} opacity={0.3} />
            </View>
            <Text 
              style={{ color: theme.dark.colors.text }} 
              className="text-lg font-bold text-center mb-2"
            >
              C'est encore vide ici
            </Text>
            <Text 
              style={{ color: theme.dark.colors.muted }} 
              className="text-sm text-center mb-10 leading-5"
            >
              Les médias que vous marquerez comme "{currentTitle}" apparaîtront ici pour un accès rapide.
            </Text>
            
            {/* CTA : Redirection vers la découverte */}
            <TouchableOpacity 
              style={{ backgroundColor: theme.dark.colors.text }}
              className="px-8 py-4 rounded-full flex-row items-center shadow-xl"
              onPress={() => router.push("/(tabs)/search")}
            >
              <Search size={18} color={theme.dark.colors.background} className="mr-2" />
              <Text 
                style={{ color: theme.dark.colors.background }} 
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