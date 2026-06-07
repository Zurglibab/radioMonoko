import api from "./Api.ts";
import type {CollectionItem} from "../interfaces/CollectionItem.types.ts";

const getItemsByCollection = async (collectionId: string):Promise<CollectionItem[]> => {
    const response = await api.get(`/collectionItems/collection/${collectionId}`);
    return response.data;
}

const addItemToCollection = async (item: CollectionItem) => {
    const response = await api.post("/collectionItems", item);
    return response.data;
}

const deleteItemFromCollection = async (collectionId: string, contentId:string) => {
    const response = await api.delete(`/collectionItems/collection/${collectionId}/content/${contentId}`);
    return response.data;
}

const updateItemFromCollection = async (collectionId: string, contentId:string, data: Partial<CollectionItem>) => {
    const response = await api.put(`/collectionItems/collection/${collectionId}/content/${contentId}`, data);
    return response.data;
}

export default { getItemsByCollection, addItemToCollection, deleteItemFromCollection, updateItemFromCollection };