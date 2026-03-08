import api from "./Api.ts";

const authService = {
    async register(email: string, password: string) {
        try {
            const response = await api.post("/user/register",
                { email, password });
            return response.data;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    },

    async login(email: string, password: string) {
        try {
            const response = await api.post("/user/login",
                { email, password });
            return response.data;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }
};

export default authService;
