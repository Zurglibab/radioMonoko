import { Platform } from "react-native";

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');
const API_BASE_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export const LiveService = {
  fetchLiveTrackInfo: async (stationId: string): Promise<{ currentSongTitle: string } | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/live/${stationId}`);
      if (!response.ok) return null;
      
      const resJson = await response.json();
      const trackInfo = resJson?.data?.song?.track;
      
      if (trackInfo?.title) {
        return {
          currentSongTitle: trackInfo.title || "Titre inconnu"
        };
      }
      return null;
    } catch {
      return null;
    }
  }
};