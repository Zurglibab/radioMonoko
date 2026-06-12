import api from "./Api.ts";
import type {AuthResponse, GoogleAuthResponse} from "../interfaces/AuthResponse.types.ts";


const register = async (email: string, username:string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/user/register", { email, username, password});
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

const loginWithGoogleToken = async (googleToken: string): Promise<GoogleAuthResponse> => {
    const response = await api.post("/auth/google-mobile", {googleToken,});
    return response.data;
};



export default {register,login, getMe, loginWithGoogleToken};

