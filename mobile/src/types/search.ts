import { Brand, WebRadio } from "./brand";
import { Friend } from "./social";
import { ContentDTO } from "./content-api";
import { CollectionDTO } from "./collection";

export type SearchType = 'all' | 'brands' | 'webradios' | 'users' | 'contents' | 'collections';

export type UserSearchResult = Friend;

/**
 * UnifiedSearchResults : Modèle de données pour les résultats d'une recherche unifiée.
 * Il regroupe les résultats de différentes catégories (marques, web radios, utilisateurs, contenus, collections publiques) pour une expérience de recherche fluide.
 * Chaque catégorie est représentée par un tableau d'objets correspondant à son type spécifique.
 * Les web radios sont enrichies avec les informations de la marque associée pour faciliter l'affichage et la navigation.
 * En cas d'erreur dans une catégorie, elle est simplement ignorée pour ne pas impacter les autres résultats.
 */
export interface UnifiedSearchResults {
  brands: Brand[];
  webRadios: WebRadioWithBrand[];
  users: UserSearchResult[];
  contents: ContentDTO[];
  publicCollections: CollectionDTO[];
}

export interface WebRadioWithBrand extends WebRadio {
  brandId: string;
  brandTitle: string;
}

export interface HistoryEntry {
  query: string;
  timestamp: number;
}
