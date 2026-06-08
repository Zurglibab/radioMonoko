import { Brand } from "@/types/brand";
import { Friend } from "@/types/social";
import { ContentDTO } from "@/types/content-api";
import { CollectionDTO } from "@/types/collection";
import { BrandService } from "@/services/brand/brand.service";
import { UserService } from "@/services/users/user.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionService } from "@/services/collections/collection.service";
import { UnifiedSearchResults, WebRadioWithBrand } from "@/types/search";

/**
 * SearchService : Service centralisé pour gérer les différentes recherches dans l'application.
 * Il fournit des méthodes pour rechercher des marques, des utilisateurs, des contenus et des collections publiques.
 * La méthode principale searchUnified lance toutes les recherches en parallèle et agrège les résultats.
 * Les recherches de contenus et de collections publiques sont effectuées localement à partir du cache backend pour une réactivité maximale.
 * Les recherches de marques et d'utilisateurs font appel au backend pour garantir des résultats à jour.
 */
export const SearchService = {
  /**
   * searchUnified : Lance une recherche unifiée sur les marques, les utilisateurs, les contenus et les collections publiques.
   * Les résultats sont filtrés et agrégés pour fournir une expérience de recherche fluide et rapide.
   * Les marques et les utilisateurs sont recherchés via des appels API, tandis que les contenus et les collections publiques sont filtrés localement à partir du cache backend.
   * Les web radios sont également filtrées localement à partir du cache des marques pour inclure les sous-éléments correspondants.
   * En cas d'erreur dans une catégorie, elle est simplement ignorée pour ne pas impacter les autres résultats.
   * @param token 
   * @param query 
   * @param allBrandsCache 
   * @returns 
   */
  searchUnified: async (
    token: string,
    query: string,
    allBrandsCache: Brand[]
  ): Promise<UnifiedSearchResults> => {
    const trimmed = query.trim();
    if (!trimmed) {
      return { brands: [], webRadios: [], users: [], contents: [], publicCollections: [] };
    }

    const [brands, users, contents, publicCollections] = await Promise.all([
      SearchService.searchBrands(token, trimmed).catch(() => [] as Brand[]),
      SearchService.searchUsers(token, trimmed).catch(() => [] as Friend[]),
      SearchService.searchContents(token, trimmed).catch(() => [] as ContentDTO[]),
      SearchService.searchPublicCollections(token, trimmed).catch(() => [] as CollectionDTO[]),
    ]);

    const webRadios = SearchService.filterWebRadios(allBrandsCache, trimmed);

    return { brands, webRadios, users, contents, publicCollections };
  },

  searchBrands: async (token: string, title: string): Promise<Brand[]> => {
    const resp = await BrandService.searchByTitle(token, title);
    return resp ?? [];
  },

  searchUsers: async (token: string, query: string): Promise<Friend[]> => {
    if (!token) return [];
    return UserService.search(token, query);
  },

  /**
   * searchContents : Filtre les contenus à partir du cache local pour une réactivité maximale.
   * Les contenus sont filtrés en fonction de la présence de la requête dans le titre ou la description.
   * En cas d'erreur lors du chargement du cache, une liste vide est retournée pour ne pas impacter les autres résultats.
   * @param token 
   * @param query 
   * @returns 
   */
  searchContents: async (token: string, query: string): Promise<ContentDTO[]> => {
    if (!token) return [];
    const all = await ContentApiService.getAll(token);
    const lower = query.toLowerCase();
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        (c.description?.toLowerCase().includes(lower) ?? false)
    );
  },

  /**
   * searchPublicCollections : Filtre les listes publiques de la communauté.
   * @param token 
   * @param query 
   * @returns 
   */
  searchPublicCollections: async (token: string, query: string): Promise<CollectionDTO[]> => {
    if (!token) return [];
    const all = await CollectionService.getAll(token);
    const lower = query.toLowerCase();
    return all.filter(
      (c) =>
        c.is_public &&
        (c.name.toLowerCase().includes(lower) ||
          (c.description?.toLowerCase().includes(lower) ?? false))
    );
  },

  /**
   * filterWebRadios : Filtre les web radios à partir du cache des marques pour inclure les sous-éléments correspondants.
   * Les web radios sont filtrées en fonction de la présence de la requête dans le titre ou la description.
   * En cas d'erreur lors du chargement du cache, une liste vide est retournée pour ne pas impacter les autres résultats.
   * @param allBrands 
   * @param query 
   * @returns 
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
        if (
          wr.title.toLowerCase().includes(lower) ||
          (wr.description?.toLowerCase().includes(lower) ?? false)
        ) {
          results.push({ ...wr, brandId: brand.id, brandTitle: brand.title });
        }
      }
    }

    return results;
  },
};
