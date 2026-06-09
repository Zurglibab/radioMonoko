export interface UserRelations {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
}