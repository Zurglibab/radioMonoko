import api from "./Api.ts";
import type {FeedItem} from "../interfaces/Feed.types.ts";

const getMyFeed = async (limit = 30): Promise<FeedItem[]> => {
    try {
        const response = await api.get("/user/me/feed", {params: {limit}});
        return response.data;
    } catch (error) {
        console.error("erreur dans getmyfeed",error);
        return [];
    }
};

export default {getMyFeed};