import api from "./Api";
import type {NotificationCreate} from "../interfaces/Notifications.types.ts";

const createNotification = async (data: NotificationCreate) => {
    try {
        const response = await api.post(`/notifications`, data);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
        throw error;
    }
};

const getNotifications = async () => {
    try {
        const response = await api.get(`/notifications`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error);
        return [];
    }
};

const getUserNotifications = async (userId: string) => {
    try {
        const response = await api.get(`/notifications/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des notifications pour ${userId}:`, error);
        return [];
    }
};

const getUnreadNotifications = async (userId: string) => {
    try {
        const response = await api.get(`/notifications/user/${userId}/unread`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des non-lues pour ${userId}:`, error);
        return [];
    }
};

const markAllAsRead = async (userId: string) => {
    try {
        return await api.patch(`/notifications/user/${userId}/read-all`);
    } catch (error) {
        console.error(`Erreur lors du marquage en lu pour ${userId}:`, error);
    }
};

const markAsRead = async (notificationId: string) => {
    try {
        return await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
        console.error(`Erreur lors du marquage de la notif ${notificationId}:`, error);
    }
};

const deleteNotification = async (notificationId: string) => {
    try {
        return await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
        console.error(`Erreur lors de la suppression de ${notificationId}:`, error);
    }
};

export default {
    createNotification,
    getNotifications,
    getUserNotifications,
    getUnreadNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification
};