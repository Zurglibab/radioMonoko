import { MediaStatus } from "@/types/content";

/**
 * Statuts de collection côté backend, correspondant aux catégories de collections système.
 * Ces statuts sont utilisés pour stocker les collections dans la base de données et faire le lien avec les statuts front.
 */
export type BackendCollectionStatus = 'à voir' | 'en cours' | 'terminé' | 'abandonné';

/**
 * Métadonnées des collections système, utilisées pour faire le lien entre les statuts front et backend, 
 * et pour afficher les titres et descriptions dans l'UI.
 * Les collections système sont des catégories prédéfinies que les utilisateurs peuvent utiliser pour organiser leurs contenus.
 */
export interface SystemCollectionMeta {
  frontStatus: MediaStatus;
  backendStatus: BackendCollectionStatus;
  displayName: string;
  description: string;
}

export const SYSTEM_COLLECTIONS: SystemCollectionMeta[] = [
  {
    frontStatus: 'to-listen',
    backendStatus: 'à voir',
    displayName: 'À écouter',
    description: 'Les ondes que vous souhaitez explorer.',
  },
  {
    frontStatus: 'in-progress',
    backendStatus: 'en cours',
    displayName: 'En cours',
    description: 'Ce que vous écoutez actuellement.',
  },
  {
    frontStatus: 'finished',
    backendStatus: 'terminé',
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
 * Helpers de lookup bidirectionnel entre front et backend.
 */
export const findSystemMeta = (frontStatus: MediaStatus): SystemCollectionMeta | undefined =>
  SYSTEM_COLLECTIONS.find(s => s.frontStatus === frontStatus);

export const findSystemMetaByBackend = (backendStatus: string | null): SystemCollectionMeta | undefined =>
  SYSTEM_COLLECTIONS.find(s => s.backendStatus === backendStatus);

/**
 * Détecte si une collection est une collection système (vs personnalisée).
 */
export const isSystemCollection = (status: string | null): boolean =>
  status !== null && SYSTEM_COLLECTIONS.some(s => s.backendStatus === status);