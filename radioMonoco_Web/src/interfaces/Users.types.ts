export interface User {
    id: string;
    email: string;
    username: string;
    display_name: string;
    avatar: string | null;
    bio: string | null;
    website: string | null;
    privacy: "public" | "private";
    is_banned: boolean;
    role: string;
    notifications_email: boolean;
    created_at: string;
    updated_at: string;
}