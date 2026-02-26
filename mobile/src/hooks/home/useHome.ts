import { useState, useEffect } from "react";
import { ContentService } from "@/services/content/content.service";
import { Station } from "@/types/content";

/**
 * useHome : Hook de récupération des données pour l'écran d'accueil.
 * Encapsule la logique d'appel au ContentService et gère les états 
 * de chargement et d'erreur pour les composants de la vue.
 */
export const useHome = () => {
    // État local pour stocker la liste des stations récupérées
    const [stations, setStations] = useState<Station[]>([]);
    // État de chargement initialisé à true pour afficher un skeleton/spinner dès le montage
    const [isLoading, setIsLoading] = useState(true);
    // Gestion des messages d'erreur pour le feedback utilisateur
    const [error, setError] = useState<string | null>(null);

    /**
     * fetchContent : Fonction asynchrone pour récupérer les stations.
     * Peut être appelée manuellement pour rafraîchir la liste.
     */
    const fetchContent = async () => {
        setIsLoading(true);
        setError(null); // Reset de l'erreur avant une nouvelle tentative
        
        try {
            // Appel au service dédié au contenu (API ou Mock)
            const data = await ContentService.getPublicStations();
            setStations(data);
        } catch (err) {
            // Je défini un message d'erreur explicite pour l'UI
            setError("Erreur lors du chargement des stations");
            console.error("Home Data Fetch Error:", err);
        } finally {
            // Je coupe le loader dans tous les cas
            setIsLoading(false);
        }
    }

    /**
     * Cycle de vie : Récupération automatique au premier rendu du composant.
     */
    useEffect(() => {
        fetchContent();
    }, []);

    // Retourne les données et une fonction 'refresh' pour le Pull-to-Refresh
    return { 
        stations, 
        isLoading, 
        error, 
        refresh: fetchContent 
    };
}