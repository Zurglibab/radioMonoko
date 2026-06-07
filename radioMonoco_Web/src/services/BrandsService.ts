import api from "./Api";
import type { Brand } from "../interfaces/Brands.types";

const getAllBrands = async (): Promise<Brand[]> => {
    try {
        const response = await api.get("/api/brands");
        const data = response.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getAllBrands Service:", error);
        return [];
    }
};

const getBrandById = async (id: string): Promise<Brand> => {
    const response = await api.get(`/api/brands/${id}`);
    return response.data?.data || response.data;
};

export default {
    getAllBrands,
    getBrandById
};