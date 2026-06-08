export interface Review {
    id: string;
    contentId: string;
    userId: string;
    comment: string;
    parent_review_id?: string | null;
    created_at: string;
}