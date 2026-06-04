import api from "./Api";
import type { User } from "../context/AuthContext";
import type { Report } from "../interfaces/Report.types";

const getUsers = async (): Promise<User[]> => {
    const response = await api.get("/admin/users")
    return response.data.data;
}

const getReports = async (): Promise<Report[]> => {
    const response = await api.get("/reports/users");
    return response.data.data;
}

const getReviews = async () => {
    const response = await api.get("/review");
    return response.data;
}

const banUser = async (id:string, banned:boolean) => {
    const response = await api.patch(`/admin/users/${id}/ban`, {banned});
    return response.data;
}

const featureReview = async (id:string, featured:boolean) => {
    const response = await api.patch(`/admin/reviews/${id}/feature`, {featured});
    return response.data;
}

const deleteReview = async (id:string) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
};

export default {getUsers, getReports, getReviews, banUser, featureReview, deleteReview}
