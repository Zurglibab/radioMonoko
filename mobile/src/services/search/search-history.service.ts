import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryEntry } from "@/types/search";

const STORAGE_KEY = "@radiomonoko:search_history";
const MAX_ENTRIES = 10;

const getKey = (userId: string): string => `${STORAGE_KEY}:${userId}`;

export const SearchHistoryService = {
  load: async (userId: string): Promise<HistoryEntry[]> => {
    if (!userId) return [];
    try {
      const raw = await AsyncStorage.getItem(getKey(userId));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  save: async (userId: string, entries: HistoryEntry[]): Promise<void> => {
    if (!userId) return;
    try {
      await AsyncStorage.setItem(getKey(userId), JSON.stringify(entries));
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

  clear: async (userId: string): Promise<void> => {
    if (!userId) return;
    try {
      await AsyncStorage.removeItem(getKey(userId));
    } catch {}
  },
};
