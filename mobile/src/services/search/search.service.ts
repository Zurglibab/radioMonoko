import { Brand } from "@/types/brand";
import { Friend } from "@/types/social";
import { ContentDTO } from "@/types/content-api";
import { CollectionDTO } from "@/types/collection";
import { BrandService } from "@/services/brand/brand.service";
import { UserService } from "@/services/users/user.service";
import { ContentApiService } from "@/services/content/content-api.service";
import { CollectionService } from "@/services/collections/collection.service";
import { UnifiedSearchResults, WebRadioWithBrand } from "@/types/search";

export const SearchService = {
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
