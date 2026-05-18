export interface Collection {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    is_public: boolean;
    created_at: string;
}