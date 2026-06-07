export interface CollectionItem {
    collection_id: string;
    content_id: string;
    position: number;
    note?: string | null;
    created_at: Date;
}