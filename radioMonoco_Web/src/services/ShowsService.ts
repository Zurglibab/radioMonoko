import api from "./Api";

const getShowsByStation = async (station: string): Promise<any[] | null> => {
    try {
        const normalizedStation = station.toUpperCase();
        const response = await api.get<any>(
            `/api/shows/${normalizedStation}`
        );
        const showsList = response.data?.data;
        if (Array.isArray(showsList)) {
            return showsList;
        }
        return null;
    } catch (error: any) {
        console.error(`Erreur dans getShowsByStation Service pour ${station}:`, error);
        return null;
    }
};

export default {
    getShowsByStation
};