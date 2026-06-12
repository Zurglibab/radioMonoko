export interface NotificationDto {
    id: string;
    user_id: string;
    type: string;
    message: string;
    is_read: boolean;
    createdAt: string;
}

export interface AppNotification {
    id: string;
    message: string;
    isRead: boolean;
    timestamp: string;
    type: 'like' | 'dislike' | 'reply' | 'system';
}

export interface NotificationCreate {
    user_id: string;
    type: string;
    message: string;
    is_read?: boolean;
}