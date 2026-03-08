/**
 * Interface Station : Le modèle de données central pour le contenu audio.
 * Définit toutes les propriétés nécessaires pour afficher une station 
 * dans les listes, les cartes ou le lecteur.
 */
export interface Station {
    id: string;              // Identifiant unique (ex: UUID ou Slug)
    title: string;           // Nom de la station ou du podcast
    description: string;     // Résumé du contenu pour l'affichage détaillé
    imageUrl: string;        // URL de la pochette ou du logo de la station
    isLive: boolean;         // Flag pour l'indicateur visuel "Direct"
    category: string;        // Genre musical ou thématique (Jazz, Rock, Tech...)
    ListenersCount: number;  // Nombre d'auditeurs actuels pour la preuve sociale
}

/**
 * Interface ContentState : Représente l'état de la donnée dans le flux UI.
 * Utilisée principalement dans les hooks (useHome)
 * pour gérer le cycle de vie de la récupération des données.
 */
export interface ContentState {
    stations: Station[];     // Liste des stations récupérées
    isLoading: boolean;      // État de chargement pour afficher le loader
    error: string | null;    // Message d'erreur en cas d'échec de l'API
}