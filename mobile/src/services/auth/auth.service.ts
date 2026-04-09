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

  toggleTwoFactor: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(enabled), 800);
    });
  },

  toggleBiometry: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(enabled), 500);
    });
  },

  getActiveSessions: async (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 's1', device: 'iPhone 15 Pro', location: 'Paris, FR', isCurrent: true, date: 'Maintenant' },
          { id: 's2', device: 'MacBook Pro M3', location: 'Lyon, FR', isCurrent: false, date: 'Il y a 2 jours' },
        ]);
      }, 1000);
    });
  },

  /**
   * Pilier Légal : Simule la demande d'exportation des données utilisateur
   */
  exportUserData: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) return reject(new Error("Email requis pour l'export."));
        console.log(`[RGPD] Préparation de l'archive pour : ${email}`);
        resolve();
      }, 2500);
    });
  },

  /**
   * Simule la suppression définitive du compte
   */
  deleteAccount: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  },

  contactSupport: async (subject: string, message: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!subject || !message) return reject(new Error("Veuillez remplir tous les champs."));
        resolve();
      }, 1500);
    });
  },

  getFaq: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { q: "Comment créer une playlist ?", a: "Allez dans 'Ma Radio', cliquez sur le '+' et donnez un nom à votre playlist." },
          { q: "Radio Monoco est-elle gratuite ?", a: "L'application propose une version gratuite financée par la communauté et une option Pro." },
          { q: "Comment activer le mode sombre ?", a: "Rendez-vous dans Profil > Apparence." }
        ]);
      }, 800);
    });
  },

  getDocumentContent: async (type: 'cgu' | 'privacy'): Promise<{title: string, content: string}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'cgu') {
          resolve({
            title: "Conditions Générales d'Utilisation",
            content: `Dernière mise à jour : Avril 2026\n\n` +
              `Bienvenue sur RadioMonoco. Les présentes Conditions Générales d’Utilisation (CGU) encadrent l’accès et l’utilisation de nos services.\n\n` +
              `1. ENGAGEMENT DE L'UTILISATEUR\n` +
              `En créant un compte, vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants. RadioMonoco se réserve le droit de suspendre tout compte dont l'activité porterait préjudice à la communauté ou à l'intégrité technique du service.\n\n` +
              `2. PROPRIÉTÉ ET DROITS D'AUTEUR\n` +
              `RadioMonoco est un agrégateur de contenus. Les flux audio, podcasts et musiques diffusés restent la propriété exclusive de leurs éditeurs respectifs. L'utilisateur bénéficie d'un droit d'écoute strictement personnel et non commercial.\n\n` +
              `3. MODÉRATION ET INTERACTION\n` +
              `La liberté d'expression est une valeur clé de l'onde partagée. Toutefois, tout propos haineux, diffamatoire ou incitant à la violence dans les critiques audio ou écrites entraînera une suppression immédiate du contenu et des sanctions pouvant aller jusqu'au bannissement définitif.\n\n` +
              `4. LIMITATION DE RESPONSABILITÉ\n` +
              `Nous nous efforçons d'assurer une disponibilité du service 24/7, mais RadioMonoco ne peut être tenu responsable des interruptions liées à la maintenance ou aux défaillances des réseaux tiers.`
          });
        } else {
          resolve({
            title: "Politique de Confidentialité",
            content: `Dernière mise à jour : Avril 2026\n\n` +
              `Chez RadioMonoco, la protection de votre vie privée n'est pas une option, c'est un principe fondamental.\n\n` +
              `1. DONNÉES COLLECTÉES\n` +
              `Nous collectons uniquement les données nécessaires au bon fonctionnement de votre expérience : votre adresse email (pour l'authentification) et vos interactions (favoris, notes) pour personnaliser vos suggestions.\n\n` +
              `2. UTILISATION ET NON-COMMERCIALISATION\n` +
              `Vos données personnelles ne sont JAMAIS vendues, louées ou échangées avec des régies publicitaires ou des tiers à des fins commerciales. Elles servent exclusivement à améliorer l'algorithme de curation de RadioMonoco.\n\n` +
              `3. SÉCURITÉ ET STOCKAGE\n` +
              `Conformément aux standards de sécurité actuels, vos informations de session sont chiffrées. Nous utilisons des technologies de pointe (SecureStore) pour garantir que vous seul ayez accès à vos données sensibles.\n\n` +
              `4. VOS DROITS (RGPD)\n` +
              `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez générer un export complet de vos informations ou supprimer votre compte instantanément depuis l'onglet "Légal" de vos paramètres.`
          });
        }
      }, 500);
    });
  },
};