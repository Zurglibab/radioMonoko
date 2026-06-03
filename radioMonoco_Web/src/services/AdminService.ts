import api from "./Api";

// const getUsers = async () => {
//     const response = await api.get("admin/users");
//     return response.data;
// }

const getReports = async () => {
    const response = await api.get("/reports/users");
    return  response.data;
}

const getReviews = async () => {
    const response = await api.get("/review");
    return  response.data;
}

const banUser = async (userId:string, banned:boolean) => {
    const response = await api.patch(`/admin/users/${userId}/ban`, {banned});
    return response.data;
}

const featureReview = async (reviewId:string, featured:boolean) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/feature`, {featured});
    return response.data;
}

const deleteReview = async (id:string) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
};

export default {getReports, getReviews, banUser, featureReview, deleteReview}
