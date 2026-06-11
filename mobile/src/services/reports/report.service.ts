import { apiFetch } from "@/utils/apiFetch";

export interface CreateReportReviewPayload {
  reporter_id: string;
  review_id: string;
  report_type: string;
  description?: string;
}

export interface CreateReportUserPayload {
  reporter_id: string;
  reported_user_id: string;
  report_type: string;
  description?: string;
}

/**
 * ReportService : Envoi des signalements (critiques et utilisateurs) vers l'API.
 * Les signalements sont ensuite traités par les administrateurs depuis l'espace admin.
 */
export const ReportService = {
  reportReview: (token: string, payload: CreateReportReviewPayload): Promise<void> =>
    apiFetch<void>("/reports/reviews", { token, method: "POST", body: payload }),

  reportUser: (token: string, payload: CreateReportUserPayload): Promise<void> =>
    apiFetch<void>("/reports/users", { token, method: "POST", body: payload }),
};
