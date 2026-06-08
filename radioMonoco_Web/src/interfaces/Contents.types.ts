export interface Content {
    id: string;
    api_id: string;
    title: string;
    description: string;
    content_type: "other" | "podcast" | "video" | string;
    created_at: string;
    external_api_id?: string;
    external_url?: string;
    url?: string;
}