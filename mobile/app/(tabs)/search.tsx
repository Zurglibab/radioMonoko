import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search as SearchIcon, X, Clock, Trash2 } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useSearch } from "@/hooks/home/useSearch";
import { PublicStationCard } from "@/features/home/components/public/PublicStationCard";

/**
 * Liste statique des catégories pour la découverte rapide.
 * Ces genres servent de raccourcis de recherche pour l'utilisateur.
 */
const CATEGORIES = [
  { name: "Jazz" }, { name: "Rock" }, { name: "Tech" },
  { name: "Culture" }, { name: "Infos" }, { name: "Histoire" },
];

/**
 * SearchScreen : Interface de recherche globale de l'application.
 * Offre une expérience fluide passant de l'historique/catégories 
 * aux résultats en temps réel grâce au hook useSearch.
 */
export default function SearchScreen() {
  // Extraction de la logique métier (recherche, historique, états)
  const { query, setQuery, results, isSearching, history, addToHistory, clearHistory } = useSearch();

  return (
    <SafeAreaView className="flex-1 bg-black">
      
      {/* Barre de recherche :
        Design minimaliste avec gestion du bouton de nettoyage (X) 
        affiché uniquement quand une saisie est présente.
      */}
      <View className="px-6 pt-4 mb-6">
        <View className="flex-row items-center bg-[#111111] border border-[#222222] rounded-2xl px-4 py-1">
          <SearchIcon size={20} color={theme.dark.colors.muted} />
          <TextInput
            className="flex-1 h-12 ml-3 text-white font-medium"
            placeholder="Radios, podcasts, genres..."
            placeholderTextColor={theme.dark.colors.muted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <View className="bg-white/10 rounded-full p-1">
                <X size={14} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {query.length === 0 ? (
          /* Vue par défaut : S'affiche quand l'utilisateur n'a rien saisi */
          <View className="px-6">
            
            {/* Section historique :
              Affiche les 5 dernières stations consultées. 
              On ne rend le bloc que s'il y a des données pour éviter les espaces vides.
            */}
            {history.length > 0 && (
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-white text-lg font-bold italic tracking-tight">Recherches récentes</Text>
                  <TouchableOpacity onPress={clearHistory} className="flex-row items-center">
                    <Trash2 size={14} color={theme.dark.colors.muted} />
                    <Text className="text-gray-500 text-[10px] font-bold uppercase ml-1">Effacer</Text>
                  </TouchableOpacity>
                </View>
                
                {history.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    className="flex-row items-center mb-4"
                    onPress={() => setQuery(item.title)} // Injecte le titre dans la recherche
                  >
                    <Clock size={16} color={theme.dark.colors.muted} />
                    <Text className="text-gray-300 ml-4 font-medium">{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Section catégories : 
              Grille de tuiles pour orienter l'utilisateur vers des genres populaires.
            */}
            <Text className="text-white text-lg font-bold mb-6 italic tracking-tight">Explorer par genre</Text>
            <View className="flex-row flex-wrap justify-between">
              {CATEGORIES.map((cat, i) => (
                <TouchableOpacity 
                  key={i} 
                  className="w-[48%] h-24 rounded-3xl mb-4 p-5 border border-white/5 items-center justify-center"
                  style={{ backgroundColor: theme.dark.colors.surface }}
                  onPress={() => setQuery(cat.name)}
                >
                  <Text className="text-white font-black uppercase text-[10px] tracking-[2px] text-center">
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          /* Vues des résultats : S'affiche dès que l'utilisateur commence à taper */
          <View className="px-6">
            <Text className="text-gray-500 text-[10px] font-bold uppercase mb-6 tracking-widest">
              {isSearching ? "Analyse des ondes..." : `${results.length} résultats trouvés`}
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {results.map((item) => (
                <PublicStationCard 
                  key={item.id} 
                  item={item} 
                  onPress={() => addToHistory(item)} // Sauvegarde dans l'historique au clic
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}