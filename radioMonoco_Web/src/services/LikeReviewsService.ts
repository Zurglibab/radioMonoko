import api from "./Api";

const transformLikesData = (apiResponse: any, currentUserId?: string | null): { likesCount: number; dislikesCount: number; userChoice: string | null } => {
    let likesCount = 0;
    let dislikesCount = 0;
    let userChoice = null;

    if (Array.isArray(apiResponse)) {
        likesCount = apiResponse.filter((item: any) => item.is_like === true).length;
        dislikesCount = apiResponse.filter((item: any) => item.is_like === false).length;
        if (currentUserId) {
            const userLike = apiResponse.find((item: any) => item.user_id === currentUserId);
            if (userLike) {
                userChoice = userLike.is_like ? "like" : "dislike";
            }
        }

    } else if (apiResponse && typeof apiResponse === 'object') {
        likesCount = apiResponse?.likes ?? apiResponse?.likesCount ?? apiResponse?.likes_count ?? 0;
        dislikesCount = apiResponse?.dislikes ?? apiResponse?.dislikesCount ?? apiResponse?.dislikes_count ?? 0;
        userChoice = apiResponse?.userChoice ?? apiResponse?.user_choice ?? null;
    }
    return { likesCount, dislikesCount, userChoice };
};

const toggleLikeReview = async (reviewId: string, userId: string, isLike: boolean): Promise<any> => {
    try {
        const payload = {
            user_id: userId,
            is_like: isLike
        };
        const response = await api.post(`/review/${reviewId}/likes`, payload);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`[LikeReviewsService.toggleLikeReview] Error for review ${reviewId}:`, {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        return null;
    }
};

const removeLikeReview = async (reviewId: string, userId: string): Promise<boolean> => {
    try {
        await api.delete(`/review/${reviewId}/likes`, {
            data: { user_id: userId }
        });
        return true;
    } catch (error) {
        console.error(`[LikeReviewsService.removeLikeReview] Error for review ${reviewId}:`, {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
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
        console.error(`[LikeReviewsService.getReviewLikes] Error for review ${reviewId}:`, {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        return null;
    }
};

const getReviewLikesCount = async (reviewId: string): Promise<any> => {
    try {
        const response = await api.get(`/review/${reviewId}/likes/count`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`[LikeReviewsService.getReviewLikesCount] Error for review ${reviewId}:`, {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
        return null;
    }
};

export default {
    toggleLikeReview,
    removeLikeReview,
    getReviewLikes,
    getReviewLikesCount,
    transformLikesData
};