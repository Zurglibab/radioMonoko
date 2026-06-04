import AsyncStorage from "@react-native-async-storage/async-storage";
import { HistoryEntry } from "@/types/search";

const STORAGE_KEY = "@radiomonoko:search_history";
const MAX_ENTRIES = 10;

/**
 * SearchHistoryService : Persistance de l'historique de recherche en local.
 */
export const SearchHistoryService = {
  /**
   * load : Hydrate l'historique depuis le stockage local.
   * Renvoie [] en cas d'erreur ou de stockage vide.
   */
  load: async (): Promise<HistoryEntry[]> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryEntry[];
      // Validation minimale pour résister à un stockage corrompu
      return Array.isArray(parsed) ? parsed : [];
    } catch (err: any) {
      if (__DEV__) console.warn("[SearchHistoryService.load]", err?.message);
      return [];
    }
  },

  /**
   * save : Persiste l'historique complet.
   * Appelée à chaque modification (add, remove, clear).
   */
  save: async (entries: HistoryEntry[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err: any) {
      if (__DEV__) console.warn("[SearchHistoryService.save]", err?.message);
    }
  },

  /**
   * addEntry : Ajoute une requête à l'historique, en gérant les doublons et la limite de taille.
   */
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

  /**
   * clear : Vide complètement l'historique stocké.
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      if (__DEV__) console.warn("[SearchHistoryService.clear]", err?.message);
    }
  },
};