import { useRef, useCallback } from 'react';
import UserService from '../services/UsersService';
import type { User } from '../interfaces/Users.types';

export const useUserCache = () => {
    const cacheRef = useRef<Record<string, string>>({});
    const getPseudo = useCallback(async (userId: string): Promise<string> => {
        if (cacheRef.current[userId]) {
            return cacheRef.current[userId];
        }
        try {
            const user: User | null = await UserService.getUserById(userId);
            if (user) {
                cacheRef.current[userId] = user.display_name;
                return user.display_name;
            }
        } catch (e) {
            console.error("Erreur récupération user", e);
        }
        return "Inconnu";
    }, []);
    return { getPseudo };
};