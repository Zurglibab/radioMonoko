export interface ReportReview {
    id: string;
    reporter_id: string;
    review_id: string;
    report_type: string;
    description?: string;
    created_at: string;
}

export interface ReportUser {
    id: string;
    reporter_id: string;
    reported_user_id: string;
    report_type: string;
    description?: string;
    created_at: string;
}

export type Report = ReportUser | ReportReview;