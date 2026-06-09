import api from "./Api";
import type { UserRelations } from "../interfaces/UserRelations.types.ts";

const getFriends = async (): Promise<UserRelations[]> => {
    try {
        const response = await api.get('/userRelation/friends');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des amis:", error);
        return [];
    }
};

const getFollowers = async (): Promise<UserRelations[]> => {
    try {
        const response = await api.get('/userRelation/followers');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des followers:", error);
        return [];
    }
};

const getFriendsById = async (id: string): Promise<UserRelations[]> => {
    try {
        const response = await api.get(`/userRelation/friends/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des amis de ${id}:`, error);
        return [];
    }
};

const getRequests = async (): Promise<UserRelations[]> => {
    try {
        const response = await api.get('/userRelation/request');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des demandes:", error);
        return [];
    }
};

const getFollowing = async (): Promise<UserRelations[]> => {
    try {
        const response = await api.get('/userRelation/following');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des suivis:", error);
        return [];
    }
};

const follow = async (id: string) => {
    try {
        const response = await api.post(`/userRelation/follow/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du follow de ${id}:`, error);
        throw error;
    }
};

const unfollow = async (id: string) => {
    try {
        const response = await api.delete(`/userRelation/unfollow/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de l'unfollow de ${id}:`, error);
        throw error;
    }
};

const acceptRequest = async (id: string) => {
    try {
        const response = await api.patch(`/userRelation/accept/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de l'acceptation de ${id}:`, error);
        throw error;
    }
};

const refuseRequest = async (id: string) => {
    try {
        const response = await api.patch(`/userRelation/refuse/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du refus de ${id}:`, error);
        throw error;
    }
};

const block = async (id: string) => {
    try {
        const response = await api.post(`/userRelation/block/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du blocage de ${id}:`, error);
        throw error;
    }
};

export default {
    getFriends,
    getFollowers,
    getFriendsById,
    getRequests,
    getFollowing,
    follow,
    unfollow,
    acceptRequest,
    refuseRequest,
    block
};