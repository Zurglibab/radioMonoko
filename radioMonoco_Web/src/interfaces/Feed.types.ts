export type FeedActivityType = | "collection_item_added" | "content_liked" |"comment_posted";

export interface FeedActor{
    id: string;
    username: string;
    avatar?: string | null;
}

export interface FeedCollection{
    id: string;
    name: string;
}

export interface FeedContent{
    id: string;
    title?: string| null;
}

export interface FeedItem{
    id: string;
    type: FeedActivityType;
    created_at: string;
    actor: FeedActor;
    collection?: FeedCollection | null;
    content?: FeedContent | null;
    comment?: string | null;
    note?: string | null;
    source_review_id?: string | null;

}