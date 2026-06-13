import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryEntry } from "@/types/search";

const STORAGE_KEY = "@radiomonoko:search_history";
const MAX_ENTRIES = 10;

export const SearchHistoryService = {
  load: async (): Promise<HistoryEntry[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  save: async (entries: HistoryEntry[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  },

  addEntry: (current: HistoryEntry[], query: string): HistoryEntry[] => {
    const trimmed = query.trim();
    if (!trimmed) return current;
    const filtered = current.filter(e => e.query.toLowerCase() !== trimmed.toLowerCase());
    const updated = [
      { query: trimmed, timestamp: Date.now() },
      ...filtered,
    ];
    return updated.slice(0, MAX_ENTRIES);
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
