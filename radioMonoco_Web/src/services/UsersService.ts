import api from "./Api";
import type { User } from "../interfaces/Users.types";

const getMe = async (): Promise<User | null> => {
    try {
        const response = await api.get("/user/me");
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getMe:", error);
        return null;
    }
};

const updateMe = async (userData: Partial<User>): Promise<User | null> => {
    try {
        const response = await api.put("/user/me", userData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans updateMe:", error);
        return null;
    }
};

const getMyLibrary = async (): Promise<any> => {
    try {
        const response = await api.get("/user/me/library");
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getMyLibrary:", error);
        return null;
    }
};

const getMyFeed = async (): Promise<any> => {
    try {
        const response = await api.get("/user/me/feed");
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getMyFeed:", error);
        return null;
    }
};

const searchUsers = async (query: string): Promise<User[]> => {
    try {
        const response = await api.get("/user/search", {
            params: { q: query }
        });
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans searchUsers:", error);
        return [];
    }
};

const getUserById = async (id: string, token?: string | null): Promise<User | null> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const response = await api.get(`/user/id/${id}`, { headers });
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getUserById:", error);
        return null;
    }
};

const deleteUser = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/user/delete/${id}`);
        return true;
    } catch (error) {
        console.error("Erreur dans deleteUser:", error);
        return false;
    }
};

export default {
    getMe,
    updateMe,
    getMyLibrary,
    getMyFeed,
    searchUsers,
    getUserById,
    deleteUser
};