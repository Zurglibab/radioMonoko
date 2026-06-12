import type {User} from "./Users.types.ts";

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User | null) => void;
    loginWithGoogleToken: (googleToken: string) => Promise<void>;
}