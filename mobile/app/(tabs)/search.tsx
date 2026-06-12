import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useThemeColors } from "@/utils/useThemeColors";
import { useSearch } from "@/hooks/home/useSearch";
import { useAuthContext } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { Station } from "@/types/content";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchDefaultView } from "@/features/search/components/SearchDefaultView";
import { SearchResultsView } from "@/features/search/components/SearchResultsView";
import { usePromptLogin } from "@/features/shared/usePromptLogin";
import { useTranslation } from "react-i18next";

export default function SearchScreen() {
  const { t } = useTranslation();
  const {
    query, setQuery,
    stations, users, contents, publicCollections,
    isSearching, history, addToHistory, clearHistory,
  } = useSearch();
  const { token, user } = useAuthContext();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const promptLogin = usePromptLogin();
  const params = useLocalSearchParams<{ q?: string }>();

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  useEffect(() => {
    const q = Array.isArray(params.q) ? params.q[0] : params.q;
    if (q) {
      setQuery(q);
      addToHistory(q);
    }
  }, [params.q, setQuery, addToHistory]);

  const colors = useThemeColors();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <SearchBar
        query={query}
        setQuery={setQuery}
        isSearching={isSearching}
        onSubmit={() => { if (query.trim()) addToHistory(query); }}
        colors={colors}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {query.length === 0 ? (
          <SearchDefaultView history={history} setQuery={setQuery} clearHistory={clearHistory} colors={colors} />
        ) : (
          <SearchResultsView
            stations={stations}
            users={users}
            contents={contents}
            publicCollections={publicCollections}
            isSearching={isSearching}
            query={query}
            addToHistory={addToHistory}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPress={(s) => playTrack(s)}
            onLongPress={(s) => {
              if (!token || !user) {
                promptLogin(t('common.guestAccess.manageStationAction'));
                return;
              }
              setSelectedStation(s);
              setIsSheetVisible(true);
            }}
            colors={colors}
          />
        )}
        <SafeAreaView edges={["bottom"]} />
      </ScrollView>

      <MediaActionSheet
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        station={selectedStation}
      />
    </SafeAreaView>
  );
}
