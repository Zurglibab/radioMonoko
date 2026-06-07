import api from "./Api";
import type { Review } from "../interfaces/Reviews.types";

const getAllReviews = async (): Promise<Review[]> => {
    try {
        const response = await api.get("/review");
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getAllReviews:", error);
        return [];
    }
};

const createReview = async (reviewData: { contentId: string; userId: string; comment: string; parent_review_id?: string }): Promise<Review | null> => {
    try {
        const payload = {
            content_id: reviewData.contentId,
            user_id: reviewData.userId,
            comment: reviewData.comment,
            parent_review_id: reviewData.parent_review_id
        };

        const response = await api.post("/review", payload);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans createReview:", error);
        return null;
    }
};

const getReviewById = async (id: string): Promise<Review | null> => {
    try {
        const response = await api.get(`/review/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getReviewById:", error);
        return null;
    }
};

const updateReview = async (id: string, commentData: { comment: string }): Promise<Review | null> => {
    try {
        const response = await api.put(`/review/${id}`, commentData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans updateReview:", error);
        return null;
    }
};

const deleteReview = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/review/${id}`);
        return true;
    } catch (error) {
        console.error("Erreur dans deleteReview:", error);
        return false;
    }
};

const getReviewsByContent = async (contentId: string): Promise<Review[]> => {
    try {
        const response = await api.get(`/review/content/${contentId}`);
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getReviewsByContent:", error);
        return [];
    }
};

const getReviewsByParent = async (parentReviewId: string): Promise<Review[]> => {
    try {
        const response = await api.get(`/review/parent/${parentReviewId}`);
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getReviewsByParent:", error);
        return [];
    }
};

export default {
    getAllReviews,
    createReview,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByContent,
    getReviewsByParent
};