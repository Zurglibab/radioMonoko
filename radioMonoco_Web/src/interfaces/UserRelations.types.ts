export interface UserRelations {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
}

export interface Friend {
    id: string;
    username: string;
    isPublic: boolean;
    avatar: string | null;
    bio: string | null;
}