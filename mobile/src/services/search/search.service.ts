import { Brand } from "@/types/brand";
import { Friend } from "@/types/social";
import { BrandService } from "@/services/brand/brand.service";
import { UserService } from "@/services/users/user.service";
import { UnifiedSearchResults, WebRadioWithBrand } from "@/types/search";

/**
 * SearchService : Orchestrateur de recherche multi-sources.
 * Centralise les appels aux différents services de recherche (BrandService, UserService)
 * et gère le filtrage local des webRadios à partir du cache de brands.
 */
export const SearchService = {
  /**
   * searchUnified : Lance les 3 recherches en parallèle.
   *
   * @param token         Token JWT pour les appels authentifiés
   * @param query         Terme de recherche
   * @param allBrandsCache Cache local de toutes les brands (pour filtrer les webRadios)
   */
  searchUnified: async (
    token: string,
    query: string,
    allBrandsCache: Brand[]
  ): Promise<UnifiedSearchResults> => {
    const trimmed = query.trim();
    if (!trimmed) {
      return { brands: [], webRadios: [], users: [] };
    }

    // Recherches en parallèle (les deux backend + un filtre local)
    const [brands, users] = await Promise.all([
      SearchService.searchBrands(token, trimmed).catch(() => []),
      SearchService.searchUsers(token, trimmed).catch(() => []),
    ]);

    // Filtrage local des webRadios : on cherche dans toutes les brands chargées
    const webRadios = SearchService.filterWebRadios(allBrandsCache, trimmed);

    return { brands, webRadios, users };
  },

  /**
   * searchBrands : Recherche de radios principales par titre.
   */
  searchBrands: async (token: string, title: string): Promise<Brand[]> => {
    try {
      return await BrandService.searchByTitle(token, title);
    } catch {
      return [];
    }
  },

  /**
   * searchUsers : Recherche d'utilisateurs publics par username.
   */
  searchUsers: async (token: string, query: string): Promise<Friend[]> => {
    try {
      return await UserService.search(token, query);
    } catch {
      return [];
    }
  },

  /**
   * filterWebRadios : Filtre côté client toutes les webRadios disponibles.
   */
  filterWebRadios: (allBrands: Brand[], query: string): WebRadioWithBrand[] => {
    const lower = query.toLowerCase();
    const results: WebRadioWithBrand[] = [];

    for (const brand of allBrands) {
      const subStations = [
        ...(brand.webRadios || []),
        ...(brand.localRadios || []),
      ];
      for (const wr of subStations) {
        const titleMatch = wr.title.toLowerCase().includes(lower);
        const descMatch = wr.description?.toLowerCase().includes(lower) ?? false;
        if (titleMatch || descMatch) {
          results.push({
            ...wr,
            brandId: brand.id,
            brandTitle: brand.title,
          });
        }
      }
    }

    return results;
  },
};