import api from "./Api";

const toggleLikeReview = async (reviewId: string, userId: string, isLike: boolean): Promise<any> => {
    try {
        const payload = {
            user_id: userId,
            is_like: isLike
        };

        const response = await api.post(`/review/${reviewId}/likes`, payload);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur dans toggleLikeReview pour la review ${reviewId}:`, error);
        return null;
    }
};

const removeLikeReview = async (reviewId: string, userId: string): Promise<boolean> => {
    try {
        await api.delete(`/review/${reviewId}/likes`, {
            params: { user_id: userId }
        });
        return true;
    } catch (error) {
        console.error(`Erreur dans removeLikeReview pour la review ${reviewId}:`, error);
        return false;
    }
};

const getReviewLikes = async (reviewId: string, userId?: string | null): Promise<any> => {
    try {
        const response = await api.get(`/review/${reviewId}/likes`, {
            params: userId ? { user_id: userId } : {}
        });
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur dans getReviewLikes pour la review ${reviewId}:`, error);
        return null;
    }
};

const getReviewLikesCount = async (reviewId: string): Promise<any> => {
    try {
        const response = await api.get(`/review/${reviewId}/likes/count`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Erreur dans getReviewLikesCount pour la review ${reviewId}:`, error);
        return null;
    }
};

export default {
    toggleLikeReview,
    removeLikeReview,
    getReviewLikes,
    getReviewLikesCount
};