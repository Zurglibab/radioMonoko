import React, { useState } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useSearch } from "@/hooks/home/useSearch";
import { useAuthContext } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { MediaActionSheet } from "@/features/library/components/MediaActionSheet";
import { Station } from "@/types/content";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchDefaultView } from "@/features/search/components/SearchDefaultView";
import { SearchResultsView } from "@/features/search/components/SearchResultsView";

export default function SearchScreen() {
  const {
    query, setQuery,
    stations, users, contents, publicCollections,
    isSearching, history, addToHistory, clearHistory,
  } = useSearch();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

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
            onLongPress={(s) => { setSelectedStation(s); setIsSheetVisible(true); }}
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
