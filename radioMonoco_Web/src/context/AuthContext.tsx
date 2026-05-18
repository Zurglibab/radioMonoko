import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from "../services/AuthService.ts";
import api from "../services/Api.ts";

<<<<<<< HEAD
export interface User {
    id: string;
    email: string;
    username: string | null;
    display_name: string | null;
    avatar: string | null;
    bio: string | null;
    website: string | null;
    privacy: "public" | "private";
    is_banned: boolean;
    created_at: string;
    updated_at: string;
=======
interface User {
    id: string;
    email: string;
    username?: string;
    avatar?: string;
>>>>>>> Collections
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            try {
                return JSON.parse(storedUser);
            } catch {
                return null;
            }
        }
        return null;
    });

    const fetchAndSetUser = async (token: string) => {
        localStorage.setItem('token', token);

        try {
            const { data } = await api.get<User>("/user/me");
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            logout();
            throw error;
        }
    };

    const register = async (email: string, password: string) => {
<<<<<<< HEAD
        const response = await authService.register(email, password);
        await fetchAndSetUser(response.token);
=======
        const response = await authService.register(email, password,);
        const token = response.token;

        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = await authService.getMe();

        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
>>>>>>> Collections
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
<<<<<<< HEAD
        await fetchAndSetUser(response.token);
    };

    const updateUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
=======
        const token = response.token;

        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = await authService.getMe();

        localStorage.setItem('user', JSON.stringify(userData));

>>>>>>> Collections
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside the AuthProvider');
    }
    return context;
};