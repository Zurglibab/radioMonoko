export interface Channel {
    id: string;
    type: string;
    description?: string;
    createdAt: string;
}

export interface Message {
    id: string;
    channelId: string;
    sender_id: string;
    content: string;
    created_at: string;
    status?: 'sending' | 'sent' | 'error';
}

export interface Member {
    id: string;
    userId: string;
    channelId: string;
    joinedAt: string;
}