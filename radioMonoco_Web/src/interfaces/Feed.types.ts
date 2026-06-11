export type FeedItemType =
    | "collection_item_added"
    | "content_liked"
    | "comment_posted"
    | "review_liked"
    | "review_created"
    | "rating_created"
    | string;

export interface BackendFeedActor {
    id: string;
    username: string;
    avatar?: string | null;
}

export interface BackendFeedCollection {
    id: string;
    name: string;
}

export interface BackendFeedContent {
    id: string;
    title?: string | null;
}

export interface BackendFeedItem {
    id: string;
    type: FeedItemType;
    created_at: string;
    actor: BackendFeedActor;
    collection?: BackendFeedCollection | null;
    content?: BackendFeedContent | null;
    comment?: string | null;
    note?: string | number | null;
    source_review_id?: string | null;
}

export interface FeedApiResponse {
    success: boolean;
    count: number;
    data: BackendFeedItem[];
}

export interface FeedItem {
    id: string;
    type: FeedItemType;

    actor_id?: string;
    actor_username?: string;
    actor_display_name?: string;
    actor_avatar?: string | null;

    content_id?: string;
    content_title?: string;
    content_url?: string;
    content_type?: "show" | "radio" | string;

    collection_id?: string;
    collection_name?: string;

    review_id?: string;
    comment?: string | null;
    rating?: number | null;
    note?: string | number | null;

    created_at: string;
}