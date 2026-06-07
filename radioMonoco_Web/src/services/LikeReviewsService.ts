import api from "./Api";

// Helper function to transform API response (Array of likes) into structured like data
const transformLikesData = (apiResponse: any, currentUserId?: string | null): { likesCount: number; dislikesCount: number; userChoice: string | null } => {
    let likesCount = 0;
    let dislikesCount = 0;
    let userChoice = null;

    if (Array.isArray(apiResponse)) {
        // API returns an array of like records
        likesCount = apiResponse.filter((item: any) => item.is_like === true).length;
        dislikesCount = apiResponse.filter((item: any) => item.is_like === false).length;

        // Find current user's choice
        if (currentUserId) {
            const userLike = apiResponse.find((item: any) => item.user_id === currentUserId);
            if (userLike) {
                userChoice = userLike.is_like ? "like" : "dislike";
            }
        }

        console.log("[transformLikesData] Transformed array response:", {
            arrayLength: apiResponse.length,
            likesCount,
            dislikesCount,
            userChoice,
            currentUserId
        });
    } else if (apiResponse && typeof apiResponse === 'object') {
        // Fallback for object format (likes_count, etc.)
        likesCount = apiResponse?.likes ?? apiResponse?.likesCount ?? apiResponse?.likes_count ?? 0;
        dislikesCount = apiResponse?.dislikes ?? apiResponse?.dislikesCount ?? apiResponse?.dislikes_count ?? 0;
        userChoice = apiResponse?.userChoice ?? apiResponse?.user_choice ?? null;

        console.log("[transformLikesData] Transformed object response:", {
            likesCount,
            dislikesCount,
            userChoice
        });
    }

    return { likesCount, dislikesCount, userChoice };
};

const toggleLikeReview = async (reviewId: string, userId: string, isLike: boolean): Promise<any> => {
    try {
        const payload = {
            user_id: userId,
            is_like: isLike
        };

        console.log("[LikeReviewsService.toggleLikeReview] Sending request:", {
            url: `/review/${reviewId}/likes`,
            payload,
            timestamp: new Date().toISOString()
        });

        const response = await api.post(`/review/${reviewId}/likes`, payload);
        
        console.log("[LikeReviewsService.toggleLikeReview] Response received:", {
            status: response.status,
            statusText: response.statusText,
            data: response?.data,
            timestamp: new Date().toISOString()
        });

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
        console.log("[LikeReviewsService.removeLikeReview] Sending DELETE request:", {
            url: `/review/${reviewId}/likes`,
            params: { user_id: userId },
            timestamp: new Date().toISOString()
        });

        const response = await api.delete(`/review/${reviewId}/likes`, {
            params: { user_id: userId }
        });

        console.log("[LikeReviewsService.removeLikeReview] Response received:", {
            status: response.status,
            statusText: response.statusText,
            data: response?.data,
            timestamp: new Date().toISOString()
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
        console.log("[LikeReviewsService.getReviewLikes] Sending GET request:", {
            url: `/review/${reviewId}/likes`,
            params: userId ? { user_id: userId } : {},
            timestamp: new Date().toISOString()
        });

        const response = await api.get(`/review/${reviewId}/likes`, {
            params: userId ? { user_id: userId } : {}
        });

        console.log("[LikeReviewsService.getReviewLikes] Response received:", {
            status: response.status,
            statusText: response.statusText,
            data: response?.data,
            extractedData: response?.data?.data || response?.data,
            timestamp: new Date().toISOString()
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
        console.log("[LikeReviewsService.getReviewLikesCount] Sending GET request:", {
            url: `/review/${reviewId}/likes/count`,
            timestamp: new Date().toISOString()
        });

        const response = await api.get(`/review/${reviewId}/likes/count`);

        console.log("[LikeReviewsService.getReviewLikesCount] Response received:", {
            status: response.status,
            statusText: response.statusText,
            data: response?.data,
            extractedData: response?.data?.data || response?.data,
            timestamp: new Date().toISOString()
        });

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