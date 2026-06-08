export interface RatingContent {
    id: string;
    contentId: string;
    userId: string;
    average_rating: number;
    comment?: string;
    created_at: string;
}

export interface RatingSummary {
    contentId: string;
    averageRating: number;
    totalRatings: number;
}