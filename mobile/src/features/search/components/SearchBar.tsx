import React from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Search as SearchIcon, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

/**
 * Propriétés attendues par la barre de recherche, incluant la requête, 
 * les fonctions pour mettre à jour la requête et soumettre la recherche, l'état de recherche et les couleurs du thème.
 */
interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  isSearching: boolean;
  onSubmit: () => void;
  colors: any;
}

/**
 * Affiche la barre de recherche avec un champ de saisie, une icône de recherche, un indicateur de chargement et un bouton pour effacer la requête.
 * @param param0 
 * @returns 
 */
export const SearchBar = ({ query, setQuery, isSearching, onSubmit, colors }: SearchBarProps) => {
  const { t } = useTranslation();

  return (
    <View className="px-6 pt-4 mb-4">
      <View
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        className="flex-row items-center border rounded-2xl px-4 py-1 h-14 shadow-sm"
      >
        <SearchIcon size={20} color={colors.muted} />
        <TextInput
          style={{ color: colors.text }}
          className="flex-1 h-full ml-3 font-bold"
          placeholder={t("search.searchBar.placeholder")}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
        {isSearching && <ActivityIndicator size="small" color={colors.primary} className="mr-2" />}
        {query.length > 0 && !isSearching && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
            <X size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
