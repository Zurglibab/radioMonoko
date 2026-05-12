import api from "./Api.ts";

interface AuthResponse{
    token: string;
}

const register = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/user/register", { email, password, username : email.split("@")[0] });
    return response.data;
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/user/login", { email, password });
    return response.data;
};

const getMe = async () => {
    const response = await api.get("/user/me");
    return response.data;
};

export default {register,login, getMe};

