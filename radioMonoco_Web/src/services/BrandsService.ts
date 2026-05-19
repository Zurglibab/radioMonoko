import api from "./Api";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../interfaces/Brands.types";

const getAllBrands = async (): Promise<Brand[]> => {
    try {
        const response = await api.get("/brands");
        const data = response.data?.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur dans getAllBrands Service:", error);
        return [];
    }
};

const getBrandById = async (id: string): Promise<Brand> => {
    const response = await api.get(`/brands/${id}`);
    return response.data?.data || response.data;
};

const createBrand = async (data: CreateBrandInput): Promise<Brand> => {
    const response = await api.post("/brands", data);
    return response.data;
};

const updateBrand = async (id: string, data: UpdateBrandInput): Promise<Brand> => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
};

const deleteBrand = async (id: string): Promise<any> => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
};

export default {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};