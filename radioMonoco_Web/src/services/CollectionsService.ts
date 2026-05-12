import api from "./Api.ts";
import type {Collection} from "../interfaces/Collections.types.ts";

const COLLECTION_URL = "/collections";

const getUserCollections = async (userId: string): Promise<Collection[]> => {
    const response = await api.get(`${COLLECTION_URL}/collection/user/${userId}`);
    return response.data;
};

const createCollection = async (data: Partial<Collection>): Promise<Collection> => {
    const response = await api.post(COLLECTION_URL, data);
    return response.data;
};

const deleteCollection = async (id : string) => {
    const response = await api.delete(`${COLLECTION_URL}/${id}`);
    return response.data;
};

const updateCollection = async (id: string, data: Partial<Collection>): Promise<Collection> => {
    const response = await api.put(`${COLLECTION_URL}/${id}`, data);
    return response.data;
}

export default {getUserCollections, createCollection, deleteCollection, updateCollection};
