import { MediaStatus } from "@/types/content";

/**
 * CollectionStatus : Statut d'une œuvre dans la bibliothèque d'un utilisateur.
 * Correspond aux 4 statuts principaux gérés par l'app : "À écouter", "En cours",
 * "Terminé", "Abandonné". Valeurs exactes envoyées par le backend (en français).
 */
export type ContentStatus = 'à voir' | 'commencer' | 'fini' | 'abandonné';

/**
 * StatusMeta : Métadonnées d'un statut (display + mapping front/backend).
 *
 * - frontStatus : slug interne (cohérent avec MediaStatus dans content.ts)
 * - backendStatus : valeur exacte envoyée à l'API
 * - displayName : libellé affiché à l'utilisateur (en français)
 * - description : utilisé pour les tooltips ou sous-titres UI
 */
export interface StatusMeta {
  frontStatus: MediaStatus;
  backendStatus: ContentStatus;
  displayName: string;
  description: string;
}

/**
 * STATUS_METADATA : Liste des 4 statuts gérés par l'application.
 * L'ordre est celui de l'affichage UI (À écouter → En cours → Terminé → Abandonné).
 */
export const STATUS_METADATA: StatusMeta[] = [
  {
    frontStatus: 'to-listen',
    backendStatus: 'à voir',
    displayName: 'À écouter',
    description: 'Les ondes que vous souhaitez explorer.',
  },
  {
    frontStatus: 'in-progress',
    backendStatus: 'commencer',
    displayName: 'En cours',
    description: 'Ce que vous écoutez actuellement.',
  },
  {
    frontStatus: 'finished',
    backendStatus: 'fini',
    displayName: 'Terminé',
    description: 'Vos écoutes accomplies.',
  },
  {
    frontStatus: 'dropped',
    backendStatus: 'abandonné',
    displayName: 'Abandonné',
    description: 'Les ondes mises de côté.',
  },
];

/**
 * findStatusMeta : Lookup par frontStatus (MediaStatus).
 */
export const findStatusMeta = (frontStatus: MediaStatus): StatusMeta | undefined =>
  STATUS_METADATA.find(s => s.frontStatus === frontStatus);

/**
 * findStatusMetaByBackend : Lookup par valeur backend (string).
 * Retourne undefined si la valeur n'est pas reconnue (cas dégradé).
 */
export const findStatusMetaByModel = (
  backendStatus: string | null | undefined
): StatusMeta | undefined =>
  backendStatus
    ? STATUS_METADATA.find(s => s.backendStatus === backendStatus)
    : undefined;