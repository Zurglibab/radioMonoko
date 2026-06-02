import { Brand, WebRadio } from "./brand";
import { Friend } from "./social";

/**
 * Types de filtres applicables à la recherche d'œuvres.
 */
export type SearchType = 'all' | 'brands' | 'webradios' | 'users';

/**
 * UserSearchResult : Utilisateur retourné par /user/search.
 * Type minimal pour l'affichage en liste (réutilise Friend qui a déjà bio+avatar).
 */
export type UserSearchResult = Friend;

/**
 * UnifiedSearchResults : Résultat combiné de la recherche unifiée.
 * Contient les résultats de tous les types (brands, webradios, users) pour une même requête.
 */
export interface UnifiedSearchResults {
  brands: Brand[];
  webRadios: WebRadioWithBrand[];
  users: UserSearchResult[];
}

/**
 * WebRadioWithBrand : Une webRadio enrichie de l'info de sa Brand parente.
 * Nécessaire pour afficher "FIP Jazz" sans perdre l'info que c'est une sous-station de FIP.
 */
export interface WebRadioWithBrand extends WebRadio {
  brandId: string;
  brandTitle: string;
}

/**
 * HistoryEntry : Une entrée d'historique de recherche persistée.
 */
export interface HistoryEntry {
  query: string;
  timestamp: number;
}