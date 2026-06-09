import api from "./Api.ts";

export type ReportType = "review" | "user";

export interface CreateReportReviewDTO {
    reporter_id?: string;
    review_id: string;
    report_type: string;
    description?: string;
}

export interface ReportReview {
    id: string;
    reporter_id: string;
    review_id: string;
    report_type: string;
    description?: string;
    created_at: string;
}

export interface CreateReportUserDTO {
    reporter_id?: string;
    reported_user_id: string;
    report_type: string;
    description?: string;
}

export interface ReportUser {
    id: string;
    reporter_id: string;
    reported_user_id: string;
    report_type: string;
    description?: string;
    created_at: string;
}

const reportReview = async (
    payload: CreateReportReviewDTO
): Promise<ReportReview> => {
    const response = await api.post("/reports/reviews", payload);
    return response.data?.data || response.data;
};

const reportUser = async (
    payload: CreateReportUserDTO
): Promise<ReportUser> => {
    const response = await api.post("/reports/users", payload);
    return response.data?.data || response.data;
};

export default {
    reportReview,
    reportUser,
};