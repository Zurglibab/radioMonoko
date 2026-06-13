import { useState, useEffect, useCallback } from "react";
import { SearchService } from "@/services/search/search.service";
import { SearchHistoryService } from "@/services/search/search-history.service";
import { HistoryEntry } from "@/types/search";
import { Brand } from "@/types/brand";
import { BrandService } from "@/services/brand/brand.service";
import { useAuthContext } from "@/context/AuthContext";
import { Station } from "@/types/content";
import { Friend } from "@/types/social";
import { ContentDTO } from "@/types/content-api";
import { CollectionDTO } from "@/types/collection";
import { mapBrandToStation, mapWebRadioToStation } from "@/utils/mappers/brand.mapper";

export const useSearch = () => {
  const { token, user } = useAuthContext();
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<Friend[]>([]);
  const [contents, setContents] = useState<ContentDTO[]>([]);
  const [publicCollections, setPublicCollections] = useState<CollectionDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (user?.id) {
      SearchHistoryService.load(user.id).then(setHistory);
    } else {
      setHistory([]);
    }
    BrandService.fetchAllBrands().then(setAllBrands).catch(() => {});
  }, [user?.id]);

  const addToHistory = useCallback(async (q: string) => {
    if (!user?.id) return;
    const userId = user.id;
    setHistory((prev) => {
      const updated = SearchHistoryService.addEntry(prev, q);
      SearchHistoryService.save(userId, updated);
      return updated;
    });
  }, [user?.id]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    if (user?.id) await SearchHistoryService.clear(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!query.trim()) {
      setStations([]);
      setUsers([]);
      setContents([]);
      setPublicCollections([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await SearchService.searchUnified(token ?? "", query, allBrands);
        const brandStations = res.brands.map(mapBrandToStation);
        const webRadioStations = res.webRadios.map((wr) =>
          mapWebRadioToStation(wr, { id: wr.brandId, title: wr.brandTitle } as Brand)
        );
        setStations([...brandStations, ...webRadioStations]);
        setUsers(res.users);
        setContents(res.contents);
        setPublicCollections(res.publicCollections);
      } catch {
        setStations([]);
        setUsers([]);
        setContents([]);
        setPublicCollections([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token, allBrands]);

  return {
    query,
    setQuery,
    stations,
    users,
    contents,
    publicCollections,
    isSearching,
    history,
    addToHistory,
    clearHistory,
  };
};
