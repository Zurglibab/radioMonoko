/**
 * WebRadio : Sous-station thématique d'une Brand principale.
 * Représente une déclinaison musicale (FIP Rock, FIP Jazz...) ou locale (France Bleu Paris...)
 * partageant l'identité de la station mère.
 */
export interface WebRadio {
  id: string;
  title: string;
  description: string;
  liveStream: string;
  playerUrl: string;
}

/**
 * Brand : Station radio principale telle que renvoyée par l'API /api/brands.
 * Reflète la structure exacte du backend RadioMonoco.
 */
export interface Brand {
  id: string;
  title: string;
  baseline: string;
  description: string;
  websiteUrl: string;
  liveStream: string;
  playerUrl: string;
  webRadios: WebRadio[];
  localRadios: WebRadio[] | null;
}

/**
 * ApiEnvelope : Format générique des réponses backend RadioMonoco.
 * Toutes les routes /api/brands enveloppent leur payload dans { success, data }.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/**
 * Réponses spécifiques des autres endpoints Brand.
 */
export interface BrandStatsCount {
  count: number;
}

/**
 * Résultat de l'opération de rafraîchissement des données d'une Brand (POST /api/brands/{brandId}/refresh).
 */
export interface BrandRefreshResult {
  message: string;
  updatedAt?: string;
  count?: number;
}

/**
 * Enveloppe de la réponse /api/brands (le backend utilise { success, data })
 */
export interface BrandsResponse {
  data: {
    brands: Brand[];
  };
}