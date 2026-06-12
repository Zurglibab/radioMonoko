import api from "./Api.ts";
import type {CreateReportReviewDTO, CreateReportUserDTO, ReportReview, ReportUser} from "../interfaces/Report.types.ts";

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