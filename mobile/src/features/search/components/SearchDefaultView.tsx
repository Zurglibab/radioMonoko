import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Clock, Trash2 } from "lucide-react-native";

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

const GENRES = ["Jazz", "Rock", "Classique", "Infos", "Techno", "Vocal"];

/**
 * Affiche la vue par défaut de la recherche, avec les recherches récentes et les genres à explorer.
 * @param param0 
 * @returns 
 */
export const SearchDefaultView = ({ history, setQuery, clearHistory, colors }: SearchDefaultViewProps) => (
  <View className="px-6 pt-2">
    {history.length > 0 && (
      <View className="mb-10">
        <View className="flex-row justify-between items-center mb-5">
          <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-[3px]">
            Recherches récentes
          </Text>
          <TouchableOpacity onPress={clearHistory} className="flex-row items-center">
            <Trash2 size={12} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="text-[9px] font-bold uppercase ml-1">Effacer</Text>
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
      Explorer les genres
    </Text>
    <View className="flex-row flex-wrap justify-between">
      {GENRES.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="w-[48%] h-20 rounded-[24px] mb-4 border items-center justify-center shadow-sm"
          onPress={() => setQuery(cat)}
        >
          <Text style={{ color: colors.text }} className="font-black text-[10px] uppercase tracking-widest">
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
