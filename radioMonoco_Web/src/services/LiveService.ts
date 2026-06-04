import api from "./Api";
import type { LiveInfo } from "../interfaces/Live.types";

const getLiveByStation = async (station: string): Promise<LiveInfo | null> => {
    try {
        const response = await api.get(`/api/live/${station.toUpperCase()}`);
        console.log(response);
        return response.data?.data?.show || null;
    } catch (error) {
        console.error(`Erreur dans getLiveByStation Service pour ${station}:`, error);
        return null;
    }
};

export default {
    getLiveByStation
};