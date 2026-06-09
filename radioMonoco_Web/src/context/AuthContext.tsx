import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from "../services/AuthService.ts";
import api from "../services/Api.ts";

export interface User {
    id: string;
    email: string;
    username: string;
    display_name: string | null;
    avatar?: string | null;
    role: string;
    bio: string | null;
    website: string | null;
    privacy: "public" | "private";
    is_banned?: boolean;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username:string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    loginWithGoogleToken: (googleToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const saveSession = async (token: string) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const userData = await authService.getMe();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }

    const register = async (email: string, username:string, password: string) => {
        const response = await authService.register(email,username,password,);
        await saveSession(response.token);
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        await saveSession(response.token);
    };

    const loginWithGoogleToken = async (googleToken: string) => {
        const response = await authService.loginWithGoogleToken(googleToken);

        if (!response.token) {
            throw new Error("Token JWT manquant après connexion Google");
        }
        await saveSession(response.token);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loginWithGoogleToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside the AuthProvider');
    }
    return context;
};