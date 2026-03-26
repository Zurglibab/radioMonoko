import { AuthResponse, User } from "@/types/auth";
import { validateEmail, validatePassword } from "@/utils/validation/validation";

/**
 * Données d'utilisateur pour les tests de connexion
 */
const MOCK_USER: User = {
  id: "1",
  email: "test@radiomonoco.com",
  username: "TestUser",
};

/**
 * AuthService : Couche d'abstraction pour les appels d'authentification.
 * Actuellement configuré en mode simulation avec des délais pour 
 * imiter le temps de réponse d'un serveur réel.
 */
export const AuthService = {
  
  /**
   * Simule une connexion utilisateur
   * @param email : Adresse mail de l'utilisateur
   * @param password : Mot de passe de l'utilisateur
   * @returns Promise<AuthResponse> : Résultat de la tentative de connexion
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      // Je simule une latence réseau de 1.5s
      setTimeout(() => {
        if (email === MOCK_USER.email && password === "Test@1234") {
          resolve({ user: MOCK_USER, token: "fake-jwt-token" });
        } else {
          reject(new Error("Identifiants invalides. Veuillez réessayer."));
        }
      }, 1500);
    });
  },

  /**
   * Simule une inscription utilisateur avec validation locale pour éviter les appels inutiles à l'API.
   * @param email : Adresse mail de l'utilisateur
   * @param password : Mot de passe choisi par l'utilisateur
   * @returns Promise<AuthResponse> : Résultat de la tentative d'inscription
   */
  register: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error("Veuillez remplir tous les champs."));
          return;
        }
        if (!validateEmail(email)) {
          reject(new Error("Format d'email invalide."));
          return;
        }
        const pass = validatePassword(password);
        if (!pass.isValid) {
          reject(new Error(pass.message));
          return;
        }
        resolve({
          user: { id: "2", email, username: email.split("@")[0] },
          token: "fake-jwt-new-user",
        });
      }, 1500);
    });
  },

  /**
   * Simule l'envoi du mail de récupération de mot de passe 
   * avec validation de l'email pour tester les erreurs côté client avant d'appeler l'API.
   */
  sendResetPasswordEmail: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) {
          reject(new Error("Veuillez entrer votre adresse email."));
          return;
        }
        if (!validateEmail(email)) {
          reject(new Error("Veuillez entrer une adresse email valide."));
          return;
        }

        if (email !== MOCK_USER.email) reject(new Error("Aucun compte associé à cet email."));

        resolve();
      }, 1500);
    });
  },

  /**
   * Simule la vérification du code OTP reçu par l'utilisateur
   */
  verifyOtpCode: async (code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Code de test universel : 123456
        if (code === "123456") {
          resolve();
        } else {
          reject(new Error("Code de vérification incorrect."));
        }
      }, 1500);
    });
  },

  /**
   * Simule la mise à jour finale du mot de passe après vérification du code OTP
    * @param password : Nouveau mot de passe choisi par l'utilisateur
   */
  resetPassword: async (password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!password) {
          reject(new Error("Veuillez entrer un nouveau mot de passe."));
          return;
        }
        const pass = validatePassword(password);
        if (!pass.isValid) {
          reject(new Error(pass.message));
          return;
        }
        resolve();
      }, 1500);
    });
  },
};