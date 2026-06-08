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

/**
 * useSearch : Hook personnalisé pour gérer la recherche d'éléments dans l'application.
 * @returns Un objet contenant les données de recherche et les fonctions de gestion.
 */
export const useSearch = () => {
  const { token } = useAuthContext();
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [users, setUsers] = useState<Friend[]>([]);
  const [contents, setContents] = useState<ContentDTO[]>([]);
  const [publicCollections, setPublicCollections] = useState<CollectionDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  useEffect(() => {
    SearchHistoryService.load().then(setHistory);
    BrandService.fetchAllBrands().then(setAllBrands).catch(() => {});
  }, []);

  const addToHistory = useCallback(async (q: string) => {
    setHistory((prev) => {
      const updated = SearchHistoryService.addEntry(prev, q);
      SearchHistoryService.save(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await SearchHistoryService.clear();
  }, []);

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
