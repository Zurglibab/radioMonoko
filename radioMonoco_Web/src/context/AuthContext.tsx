import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import authService from "../services/AuthService.ts";
import api from "../services/Api.ts";

interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
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
        const token = await authService.register(email, password);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({email}));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ email });
    };

    const login = async (email: string, password: string) => {
        const token = await authService.login(email, password);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({email}));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ email });
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
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