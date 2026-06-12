export interface AuthResponse{
    token: string;
}

export interface GoogleAuthResponse {
    success: boolean;
    token: string;
    user?: {
        id: string;
        email: string;
    };
}