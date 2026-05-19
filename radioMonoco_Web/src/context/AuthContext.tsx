import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from "../services/AuthService.ts";
import api from "../services/Api.ts";

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
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void; // <-- Corrigé : Déclaré dans le type
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

    const register = async (email: string, password: string) => {
        const response = await authService.register(email, password,);
        const token = response.token;

        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = await authService.getMe();

        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        const token = response.token;

        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const userData = await authService.getMe();

        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
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
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
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