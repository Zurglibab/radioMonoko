import { AuthResponse, User, UpdateUserPayload } from "@/types/auth";
import { apiFetch } from "@/utils/apiFetch";

export const AuthService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await apiFetch<AuthResponse>('/user/login', {
        method: 'POST',
        body: { email, password },
      });
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        throw new Error("Identifiants invalides.");
      }
      throw new Error("Une erreur est survenue lors de la connexion.");
    }
  },

  loginWithGoogleToken: async (googleToken: string): Promise<AuthResponse> => {
    try {
      return await apiFetch<AuthResponse>('/auth/google-mobile', {
        method: 'POST',
        body: { googleToken },
      });
    } catch (error: any) {
      if (error?.message?.includes("400")) {
        throw new Error("Token Google invalide ou expiré.");
      }
      if (error?.message?.includes("401")) {
        throw new Error("Authentification Google refusée par le serveur.");
      }
      throw new Error("Connexion via Google impossible.");
    }
  },

  register: async (email: string, password: string, username: string): Promise<AuthResponse> => {
    try {
      return await apiFetch<AuthResponse>('/user/register', {
        method: 'POST',
        body: { email, password, username, privacy: "public" },
      });
    } catch (error: any) {
      if (error?.message?.includes("HTTP 400")) {
        throw new Error("Données invalides ou utilisateur déjà existant.");
      }
      throw new Error("Erreur lors de la création du compte.");
    }
  },

  getCurrentUser: async (token: string): Promise<User> => {
    try {
      return await apiFetch<User>('/user/me', { token });
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        throw new Error("Session expirée ou invalide.");
      }
      if (error?.message?.includes("HTTP 404")) {
        throw new Error("Utilisateur non trouvé.");
      }
      throw new Error("Impossible de récupérer les informations de votre profil.");
    }
  },

  updateCurrentUser: async (token: string, payload: UpdateUserPayload): Promise<User> => {
    try {
      return await apiFetch<User>('/user/me', {
        token,
        method: 'PUT',
        body: payload,
      });
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        throw new Error("Session expirée ou invalide.");
      }
      if (error?.message?.includes("HTTP 403")) {
        throw new Error("Modification du mot de passe non autorisée via cette route.");
      }
      if (error?.message?.includes("HTTP 404")) {
        throw new Error("Utilisateur non trouvé.");
      }
      throw new Error("Erreur lors de la mise à jour des informations.");
    }
  },

  exportUserData: async (token: string, userId: string): Promise<unknown> => {
    try {
      return await apiFetch<unknown>(`/user/${userId}/export`, { token });
    } catch {
      throw new Error("Impossible de générer l'export.");
    }
  },
};
