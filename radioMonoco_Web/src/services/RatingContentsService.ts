import api from "./Api";
import type { RatingContent, RatingSummary } from "../interfaces/RatingContents.types";

const getAllRatings = async (): Promise<RatingContent[]> => {
    try {
        const response = await api.get("/ratingContent");
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getAllRatings:", error);
        return [];
    }
};

const createRating = async (ratingData: { contentId: string; userId: string; average_rating: number }): Promise<RatingContent | null> => {
    try {
        const payload = {
            content_id: ratingData.contentId,
            user_id: ratingData.userId,
            average_rating: ratingData.average_rating
        };

        const response = await api.post("/ratingContent", payload);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans createRating:", error);
        return null;
    }
};

const getRatingSummary = async (contentId: string): Promise<RatingSummary | null> => {
    try {
        const response = await api.get(`/ratingContent/content/${contentId}/summary`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getRatingSummary:", error);
        return null;
    }
};

const getRatingByIds = async (contentId: string, userId: string): Promise<RatingContent | null> => {
    try {
        const response = await api.get(`/ratingContent/content/${contentId}/user/${userId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getRatingByIds:", error);
        return null;
    }
};

const updateRating = async (contentId: string, userId: string, ratingData: { average_rating: number; comment?: string }): Promise<RatingContent | null> => {
    try {
        const response = await api.put(`/ratingContent/content/${contentId}/user/${userId}`, ratingData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans updateRating:", error);
        return null;
    }
};

const deleteRating = async (contentId: string, userId: string): Promise<boolean> => {
    try {
        await api.delete(`/ratingContent/content/${contentId}/user/${userId}`);
        return true;
    } catch (error) {
        console.error("Erreur dans deleteRating:", error);
        return false;
    }
};

export default {
    getAllRatings,
    createRating,
    getRatingSummary,
    getRatingByIds,
    updateRating,
    deleteRating
};