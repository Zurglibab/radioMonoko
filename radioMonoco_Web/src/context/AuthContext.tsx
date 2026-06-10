import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from "../services/AuthService.ts";
import api from "../services/Api.ts";
import type { User } from "../interfaces/Users.types.ts";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User | null) => void;
    loginWithGoogleToken: (googleToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Erreur de parsing user", e);
            }
        }
    }, []);

    const saveSession = async (token: string) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const userData = await authService.getMe();
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }

    const register = async (email: string, username: string, password: string) => {
        const response = await authService.register(email, username, password);
        await saveSession(response.token);
    };

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        await saveSession(response.token);
    };

    const loginWithGoogleToken = async (googleToken: string) => {
        const response = await authService.loginWithGoogleToken(googleToken);
        if (!response.token) {
            throw new Error("Token JWT manquant");
        }
        await saveSession(response.token);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    };

    // 3. Implémentation compatible avec User | null
    const updateUser = (updatedUser: User | null) => {
        if (updatedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
            localStorage.removeItem('user');
        }
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