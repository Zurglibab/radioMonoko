import api from "./Api";

const STATION_MAPPING: Record<string, string> = {
    "FRANCEMUSIQUE": "FRANCEMUSIC"
};

/**
 * Récupère la liste complète des émissions et de leurs diffusions pour une station donnée.
 * Renvoie directement le tableau d'émissions contenu dans l'objet 'data' du JSON.
 */
const getShowsByStation = async (station: string): Promise<any[] | null> => {
    try {
        let normalizedStation = station.toUpperCase();

        if (STATION_MAPPING[normalizedStation]) {
            normalizedStation = STATION_MAPPING[normalizedStation];
        }

        // On intercepte la réponse Axios
        const response = await api.get<any>(
            `/api/shows/${normalizedStation}`
        );

        console.log("Response Shows API:", response);

        // Au vu de ton JSON : {"success": true, "data": [...]}
        // response.data correspond au corps JSON de l'API. On cherche la propriété .data à l'intérieur.
        const showsList = response.data?.data;

        if (Array.isArray(showsList)) {
            return showsList;
        }

        return null;
    } catch (error: any) {
        console.error(`Erreur dans getShowsByStation Service pour ${station}:`, error);
        if (error.response) {
            console.log("Data du serveur lors du crash:", error.response.data);
        }
        return null;
    }
};

export default {
    getShowsByStation
};