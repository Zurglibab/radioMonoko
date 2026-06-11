import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

/**
 * Représente une entrée dans l'historique des recherches, avec la requête et un timestamp pour l'identification.
 */
interface SearchHistoryEntry {
  query: string;
  timestamp: number;
}

/**
 * Affiche les recherches récentes et des suggestions de genres à explorer.
 */
interface SearchDefaultViewProps {
  history: SearchHistoryEntry[];
  setQuery: (q: string) => void;
  clearHistory: () => void;
  colors: any;
}

const GENRE_KEYS = ["jazz", "rock", "classical", "news", "techno", "vocal"] as const;

/**
 * Affiche la vue par défaut de la recherche, avec les recherches récentes et les genres à explorer.
 * @param param0
 * @returns
 */
export const SearchDefaultView = ({ history, setQuery, clearHistory, colors }: SearchDefaultViewProps) => {
  const { t } = useTranslation();

  return (
    <View className="px-6 pt-2">
      {history.length > 0 && (
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-5">
            <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px]">
              {t("search.searchDefaultView.recentSearches")}
            </Text>
            <TouchableOpacity onPress={clearHistory} className="flex-row items-center">
              <Trash2 size={12} color={colors.muted} />
              <Text style={{ color: colors.muted }} className="text-[9px] font-bold uppercase ml-1">
                {t("search.searchDefaultView.clear")}
              </Text>
            </TouchableOpacity>
          </View>
          {history.map((entry) => (
            <TouchableOpacity
              key={entry.timestamp}
              className="flex-row items-center py-3"
              onPress={() => setQuery(entry.query)}
            >
              <Clock size={16} color={colors.muted} />
              <Text style={{ color: colors.text }} className="ml-4 font-medium opacity-80">
                {entry.query}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px] mb-5">
        {t("search.searchDefaultView.exploreGenres")}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {GENRE_KEYS.map((genreKey) => {
          const label = t(`search.searchDefaultView.genres.${genreKey}`);
          return (
            <TouchableOpacity
              key={genreKey}
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="w-[48%] h-20 rounded-[24px] mb-4 border items-center justify-center shadow-sm"
              onPress={() => setQuery(label)}
            >
              <Text style={{ color: colors.text }} className="font-black text-[10px] uppercase tracking-widest">
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
