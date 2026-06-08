import api from "./Api";
import type { LiveInfo } from "../interfaces/Lives.types.ts";

const getLiveByStation = async (station: string): Promise<LiveInfo | null> => {
    try {
        const response = await api.get(`/api/live/${station.toUpperCase()}`);
        return response.data?.data?.show || null;
    } catch (error) {
        console.error(`Erreur dans getLiveByStation Service pour ${station}:`, error);
        return null;
    }
};

export default {
    getLiveByStation
};