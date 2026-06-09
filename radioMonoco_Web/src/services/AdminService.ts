import api from "./Api";
import type { User } from "../context/AuthContext";
import type { ReportReview, ReportUser, Report } from "../interfaces/Report.types";
import type { Review } from "../interfaces/Review.types";

const extractArray = <T>(response: any): T[] => {
    const payload = response?.data?.data ?? response?.data ?? response;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.reports)) return payload.reports;
    if (Array.isArray(payload?.results)) return payload.results;

    return [];
};

const extractData = <T>(response: any): T => {
    return response?.data?.data ?? response?.data;
};

const getUsers = async (): Promise<User[]> => {
    const response = await api.get("/admin/users");
    return extractArray<User>(response);
};

const getUserById = async (id: string): Promise<User | null> => {
    try {
        const response = await api.get(`/user/id/${id}`);
        return extractData<User>(response);
    } catch (error) {
        console.error("Erreur getUserById admin:", error);
        return null;
    }
};

const getUserReports = async (): Promise<ReportUser[]> => {
    const response = await api.get("/reports/users");
    return extractArray<ReportUser>(response);
};

const getReviewReports = async (): Promise<ReportReview[]> => {
    const response = await api.get("/reports/reviews");
    return extractArray<ReportReview>(response);
};

const getReports = async (): Promise<Report[]> => {
    const [userReports, reviewReports] = await Promise.all([
        getUserReports().catch(() => []),
        getReviewReports().catch(() => []),
    ]);

    return [...userReports, ...reviewReports];
};

const deleteUserReport = async (id: string) => {
    const response = await api.delete(`/reports/users/${id}`);
    return response.data;
};

const deleteReviewReport = async (id: string) => {
    const response = await api.delete(`/reports/reviews/${id}`);
    return response.data;
};

const clearUserReports = async (reportedUserId: string) => {
    const response = await api.delete(`/reports/users/by-reported-user/${reportedUserId}`);
    return response.data;
};

const clearReviewReports = async (reviewId: string) => {
    const response = await api.delete(`/reports/reviews/by-review/${reviewId}`);
    return response.data;
};

const getReviews = async (): Promise<Review[]> => {
    const response = await api.get("/review");
    return extractArray<Review>(response);
};

const getReviewById = async (id: string): Promise<Review | null> => {
    try {
        const response = await api.get(`/review/${id}`);
        return extractData<Review>(response);
    } catch (error) {
        console.error("Erreur getReviewById admin:", error);
        return null;
    }
};

const banUser = async (id: string, ban: boolean) => {
    const response = await api.patch(`/admin/users/${id}/ban`, { ban });
    return response.data;
};

const featureReview = async (id: string, featured: boolean) => {
    const response = await api.patch(`/admin/reviews/${id}/feature`, { featured });
    return response.data;
};

const deleteReview = async (id: string) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
};

export default {
    getUsers,
    getUserById,
    getReports,
    getUserReports,
    getReviewReports,
    deleteUserReport,
    deleteReviewReport,
    clearUserReports,
    clearReviewReports,
    getReviews,
    getReviewById,
    banUser,
    featureReview,
    deleteReview,
};