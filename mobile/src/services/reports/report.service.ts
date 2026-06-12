import { apiFetch } from "@/utils/apiFetch";

export interface CreateReportReviewPayload {
  reporter_id: string;
  review_id: string;
  report_type: string;
  description?: string;
}

export const ReportService = {
  reportReview: (token: string, payload: CreateReportReviewPayload): Promise<void> =>
    apiFetch<void>("/reports/reviews", { token, method: "POST", body: payload }),
};
