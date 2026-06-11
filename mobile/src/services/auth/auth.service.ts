import { AuthResponse, User, UpdateUserPayload } from "@/types/auth";
import { validatePassword } from "@/utils/validation/validation";
import { apiFetch } from "@/utils/apiFetch";

/**
 * AuthService : Service d'authentification centralisé pour gérer les interactions avec le backend liées à l'authentification et la gestion du compte utilisateur.
 * Il fournit des fonctions pour se connecter, s'inscrire, récupérer et mettre à jour le profil utilisateur, gérer la réinitialisation de mot de passe, et d'autres opérations liées à la sécurité du compte.
 * Chaque fonction est conçue pour lancer des erreurs explicites en cas d'échec, facilitant ainsi la gestion des erreurs côté client.
 */
export const AuthService = {

  /**
   * login : Authentifie un utilisateur avec son email et son mot de passe.
   * En cas de succès, retourne un token d'authentification à utiliser pour les requêtes protégées.
   * En cas d'échec, lance une erreur avec un message clair.
   * @param email 
   * @param password 
   * @returns 
   */
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

  /**
   * loginWithGoogleToken : Authentifie un utilisateur via un token Google OAuth.
   * Le backend gère l'upsert du compte (création si nouveau, connexion sinon) pour simplifier le flux d'inscription/connexion.
   * En cas de succès, retourne un token d'authentification de l'application.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré.
   * @param googleToken 
   * @returns 
   */
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

  /**
   * register : Crée un nouveau compte utilisateur avec email, mot de passe et nom d'utilisateur.
   * En cas de succès, retourne un token d'authentification pour la session.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (données invalides, utilisateur existant, etc.).
   * @param email 
   * @param password 
   * @param username 
   * @returns 
   */
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

  /**
   * getCurrentUser : Récupère les informations du profil de l'utilisateur actuellement connecté.
   * En cas de succès, retourne un objet User avec les données du profil.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (session expirée, utilisateur non trouvé, etc.).
   * @param token 
   * @returns 
   */
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

  /**
   * updateCurrentUser : Met à jour les informations du profil de l'utilisateur connecté.
   * Accepte un payload avec les champs modifiables (display_name, avatar, bio, website, privacy).
   * En cas de succès, retourne l'objet User mis à jour.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (session expirée, données invalides, etc.).
   * @param token 
   * @param payload 
   * @returns 
   */
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

  /**
   * sendResetPasswordEmail : Envoie un email de réinitialisation de mot de passe à l'adresse fournie.
   * En cas de succès, confirme l'envoi de l'email.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (email non associé à un compte, etc.).
   * @param email 
   */
  sendResetPasswordEmail: async (email: string): Promise<void> => {
    try {
      await apiFetch<void>('/user/reset-password', {
        method: 'POST',
        body: { email },
      });
    } catch (error: any) {
      if (error?.message?.includes("HTTP 404")) {
        throw new Error("Aucun compte associé à cet email.");
      }
      throw new Error("Impossible d'envoyer l'email de réinitialisation.");
    }
  },

  /**
   * verifyOtpCode : Vérifie le code OTP envoyé par email pour valider la réinitialisation du mot de passe.
   * En cas de succès, confirme la validité du code.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (code incorrect, expiré, etc.).
   * @param code 
   */
  verifyOtpCode: async (code: string): Promise<void> => {
    try {
      await apiFetch<void>('/user/verify-otp', {
        method: 'POST',
        body: { otp: code },
      });
    } catch (error: any) {
      if (error?.message?.includes("HTTP 400")) {
        throw new Error("Code de vérification incorrect ou expiré.");
      }
      throw new Error("Impossible de vérifier le code.");
    }
  },

  /**
   * resetPassword : Réinitialise le mot de passe de l'utilisateur après validation du code OTP.
   * En cas de succès, confirme la réinitialisation du mot de passe.
   * En cas d'échec, lance une erreur avec un message clair selon le type d'erreur rencontré (mot de passe non conforme, etc.).
   * @param password 
   */
  resetPassword: async (password: string): Promise<void> => {
    const pass = validatePassword(password);
    if (!pass.isValid) throw new Error(pass.message);

    try {
      await apiFetch<void>('/user/reset-password/confirm', {
        method: 'POST',
        body: { newPassword: password },
      });
    } catch {
      throw new Error("Impossible de réinitialiser le mot de passe.");
    }
  },

  /**
   * exportUserData : Récupère un export complet des données personnelles de l'utilisateur (RGPD) :
   * profil, favoris, statuts, collections et notes.
   * Route backend : GET /user/{id}/export.
   * @param token
   * @param userId
   * @returns
   */
  exportUserData: async (token: string, userId: string): Promise<unknown> => {
    try {
      return await apiFetch<unknown>(`/user/${userId}/export`, { token });
    } catch {
      throw new Error("Impossible de générer l'export.");
    }
  },

};