import { AuthResponse, User } from "@/types/auth";

/**
 * Données d'utilisateur pour les tests de connexion
 */
const MOCK_USER: User = {
  id: "1",
  email: "test@radiomonoko.com",
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
        if (email === "test@radiomonoko.com" && password === "Test@1234") {
          resolve({ user: MOCK_USER, token: "fake-jwt-token" });
        } else {
          reject(new Error("Identifiants invalides. Veuillez réessayer."));
        }
      }, 1500);
    });
  },

  /**
   * Simule une inscription utilisateur
   */
  register: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validation basique pour tester le catch d'erreur du hook
        if (email.includes("@")) {
          resolve({ 
            user: { id: "2", email, username: email.split('@')[0] }, 
            token: "fake-jwt-new-user" 
          });
        } else {
          reject(new Error("Format d'email invalide."));
        }
      }, 1500);
    });
  },

  /**
   * Simule l'envoi du mail de récupération de mot de passe
   */
  sendResetPasswordEmail: async (email: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1500));
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
   * Simule la mise à jour finale du mot de passe
   */
  resetPassword: async (password: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }
};