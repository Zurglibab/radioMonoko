import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    name: string;
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
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const register = async (email: string, password: string) => {
        const userTest: User = { id: '1', name: 'Test User', email };
        setUser(userTest);
        localStorage.setItem('user', JSON.stringify(userTest));
    }

    const login = async (email: string, password: string) => {
        const userTest: User = { id: '1', name: 'Test User', email };
        setUser(userTest);
        localStorage.setItem('user', JSON.stringify(userTest));
    }

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used insde the authprovider');
    }
    return context;
};




