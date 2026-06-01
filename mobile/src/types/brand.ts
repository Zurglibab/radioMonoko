/**
 * WebRadio : Sous-station thématique d'une Brand principale.
 * Représente une déclinaison musicale (FIP Rock, FIP Jazz...) ou locale (France Bleu Paris...)
 * partageant l'identité de la station mère.
 */
export interface WebRadio {
  id: string;
  title: string;
  description: string;
  liveStream: string;     // URL du flux audio direct (mp3)
  playerUrl: string;      // URL embarquée du player officiel
}

/**
 * LocalRadio : Déclinaison régionale d'une Brand.
 * Même structure que WebRadio mais peut contenir des champs géographiques additionnels.
 */
export type LocalRadio = WebRadio;

/**
 * Brand : Station radio principale telle que renvoyée par l'API /api/brands.
 * Reflète la structure exacte du backend RadioMonoko.
 */
export interface Brand {
  id: string;                  // ID lisible (ex: "FIP", "FRANCEINTER")
  title: string;               // Nom officiel de la station
  baseline: string;            // Slogan / tagline marketing
  description: string;         // Description longue
  websiteUrl: string;          // Site web officiel
  liveStream: string;          // URL du flux audio direct principal
  playerUrl: string;           // URL embarquée du player officiel
  webRadios: WebRadio[];       // Déclinaisons thématiques (peut être vide)
  localRadios: LocalRadio[];   // Déclinaisons régionales (peut être vide)
}

/**
 * ApiEnvelope : Format générique des réponses backend RadioMonoko.
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

export interface BrandRefreshResult {
  message: string;
  updatedAt?: string;
  count?: number;
}