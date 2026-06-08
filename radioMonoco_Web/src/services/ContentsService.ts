import api from "./Api";
import type { Content } from "../interfaces/Contents.types";

const getFavoritesByUser = async (userId: string): Promise<Content[]> => {
    try {
        const response = await api.get(`/content/favorites/user/${userId}`);
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Erreur dans getFavoritesByUser:", error);
        return [];
    }
};

const getFavoriteByIds = async (contentId: string, userId: string): Promise<any> => {
    try {
        const response = await api.get(`/content/favorites/${contentId}/user/${userId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getFavoriteByIds:", error);
        return null;
    }
};

const deleteFavorite = async (contentId: string, userId: string): Promise<boolean> => {
    try {
        await api.delete(`/content/favorites/${contentId}/user/${userId}`);
        return true;
    } catch (error) {
        console.error("Erreur dans deleteFavorite:", error);
        return false;
    }
};

const addFavorite = async (favoriteData: { contentId: string; userId: string }): Promise<any> => {
    try {
        const response = await api.post("/content/favorites", favoriteData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans addFavorite:", error);
        return null;
    }
};

const getAllContents = async (): Promise<Content[]> => {
    try {
        const response = await api.get("/content");
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getAllContents:", error);
        return [];
    }
};

const createContent = async (contentData: Partial<Content>): Promise<Content | null> => {
    try {
        const response = await api.post("/content", contentData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans createContent:", error);
        return null;
    }
};

const resolveExternalApiId = async (apiId: string): Promise<Content | null> => {
    try {
        const response = await api.get(`/content/api/${apiId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans resolveExternalApiId:", error);
        return null;
    }
};

const getContentById = async (id: string): Promise<Content | null> => {
    try {
        const response = await api.get(`/content/${id}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getContentById:", error);
        return null;
    }
};

const updateContent = async (id: string, contentData: Partial<Content>): Promise<Content | null> => {
    try {
        const response = await api.put(`/content/${id}`, contentData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans updateContent:", error);
        return null;
    }
};

const deleteContent = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/content/${id}`);
        return true;
    } catch (error) {
        console.error("Erreur dans deleteContent:", error);
        return false;
    }
};

const getContentStatusList = async (): Promise<string[]> => {
    try {
        const response = await api.get("/content/status/list");
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getContentStatusList:", error);
        return [];
    }
};

const getContentStatusByUser = async (contentId: string, userId: string): Promise<any> => {
    try {
        const response = await api.get(`/content/status/${contentId}/user/${userId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans getContentStatusByUser:", error);
        return null;
    }
};

const updateContentStatus = async (statusData: { contentId: string; userId: string; status: string }): Promise<any> => {
    try {
        const response = await api.put("/content/status", statusData);
        return response.data?.data || response.data;
    } catch (error) {
        console.error("Erreur dans updateContentStatus:", error);
        return null;
    }
};

export default {
    getFavoritesByUser,
    getFavoriteByIds,
    deleteFavorite,
    addFavorite,
    getAllContents,
    createContent,
    resolveExternalApiId,
    getContentById,
    updateContent,
    deleteContent,
    getContentStatusList,
    getContentStatusByUser,
    updateContentStatus
};