import { Brand } from "@/types/brand";
import { Friend } from "@/types/social";
import { BrandService } from "@/services/brand/brand.service";
import { UserService } from "@/services/users/user.service";
import { UnifiedSearchResults, WebRadioWithBrand } from "@/types/search";

/**
 * SearchService : Orchestrateur de recherche multi-sources.
 *
 * Combine en parallèle :
 * - Recherche de Brands via /api/brands/search/{title}
 * - Recherche d'utilisateurs publics via /user/search?q=...
 * - Filtrage côté client des WebRadios (sous-stations) à partir de TOUTES les brands
 *   chargées une fois et mises en cache
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
      // À adapter selon ta signature actuelle de BrandService
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
   *
   * Le backend n'expose pas de route de recherche pour les webRadios, donc on
   * itère sur le cache local des brands (chargé une fois). Performant car les
   * webRadios sont en quantité raisonnable (~50 au total Radio France).
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