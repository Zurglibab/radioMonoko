import api from "./Api.ts";
import type {Collection} from "../interfaces/Collections.types.ts";



const getUserCollections = async (userId: string): Promise<Collection[]> => {
    const response = await api.get(`/collections/collection/user/${userId}`);
    return response.data;
};

const getCollectionById = async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
};

const createCollection = async (
    userId: string,
    name: string,
    description: string,
    isPublic: boolean
)=> {
    const response = await api.post("/collections", {
        user_id: userId,
        name,
        description,
        is_public: isPublic
    });
    return response.data;
};

const deleteCollection = async (id : string) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
};

const updateCollection = async (id: string, data: Partial<Collection>): Promise<Collection> => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
}

export default {getUserCollections, createCollection, deleteCollection, updateCollection, getCollectionById};
