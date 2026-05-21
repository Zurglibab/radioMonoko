import { AuthResponse, User, UpdateUserPayload } from "@/types/auth";
import { validateEmail, validatePassword } from "@/utils/validation/validation";
import { Platform } from "react-native";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

/**
 * Données d'utilisateur pour les fallbacks ou tests de récupération locaux
 */
const MOCK_USER: User = {
  id: "1",
  email: "test@radiomonoco.com",
  username: "TestUser",
  privacy: "public"
};

/**
 * AuthService : Couche d'abstraction pour les appels d'authentification et de profil.
 * Connecté aux endpoints réels du Swagger pour le flux d'authentification principal.
 */
export const AuthService = {
  
  /**
   * Connexion réelle à l'API Swagger - POST /user/login
   * @param email Adresse mail nettoyée de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Promise<AuthResponse> Renvoie uniquement le token JWT
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log(`[AuthService] Connexion sur : ${API_BASE_URL}/user/login`);
    
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Identifiants invalides.");
      }
      throw new Error("Une erreur est survenue lors de la connexion.");
    }

    return response.json();
  },

  /**
   * Inscription avec le backend - POST /user/register
   * @param email Adresse mail nettoyée de l'utilisateur
   * @param password Mot de passe choisi par l'utilisateur
   * @returns Promise<AuthResponse> Renvoie uniquement le token JWT
   **/
  register: async (email: string, password: string): Promise<AuthResponse> => {
    console.log(`[AuthService] Inscription sur : ${API_BASE_URL}/user/register`);

    const payload = {
      email,
      password,
      username: email.split("@")[0],
      privacy: "public"
    };

    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Données invalides ou utilisateur déjà existant.");
      }
      throw new Error("Erreur lors de la création du compte.");
    }

    return response.json();
  },

  /**
   * Récupération du profil réel depuis PostgreSQL - GET /user/me
   * @param token Le jeton JWT de l'utilisateur connecté
   * @returns Promise<User> Les données utilisateur complètes sans le mot de passe
   */
  getCurrentUser: async (token: string): Promise<User> => {
    console.log(`[AuthService] Récupération profil sur : ${API_BASE_URL}/user/me`);

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Session expirée ou invalide (Non autorisé).");
      if (response.status === 404) throw new Error("Utilisateur non trouvé.");
      throw new Error("Impossible de récupérer les informations de votre profil.");
    }

    return response.json();
  },

  /**
   * Mise à jour du profil utilisateur - PUT /user/me
   * @param token Le jeton JWT de l'utilisateur connecté
   * @param payload Les champs modifiables (display_name, bio, website, avatar, privacy)
   * @returns Promise<User> Le profil mis à jour
   */
  updateCurrentUser: async (token: string, payload: UpdateUserPayload): Promise<User> => {
    console.log(`[AuthService] Mise à jour profil sur : ${API_BASE_URL}/user/me`);

    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Non autorisé.");
      if (response.status === 403) throw new Error("Modification du mot de passe non autorisée via cette route.");
      if (response.status === 404) throw new Error("Utilisateur non trouvé.");
      throw new Error("Erreur lors de la mise à jour des informations.");
    }

    return response.json();
  },

  /**
   * Envoi d'un email de réinitialisation de mot de passe - POST /user/reset-password
   * @param email 
   * @returns 
   */
  sendResetPasswordEmail: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) return reject(new Error("Veuillez entrer votre adresse email."));
        if (!validateEmail(email)) return reject(new Error("Veuillez entrer une adresse email valide."));
        if (email !== MOCK_USER.email) return reject(new Error("Aucun compte associé à cet email."));
        resolve();
      }, 1500);
    });
  },

  /**
   * Vérification du code OTP pour la réinitialisation de mot de passe - POST /user/verify-otp
   * @param code 
   * @returns 
   */
  verifyOtpCode: async (code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code === "123456") resolve();
        else reject(new Error("Code de vérification incorrect."));
      }, 1500);
    });
  },

  resetPassword: async (password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!password) return reject(new Error("Veuillez entrer un nouveau mot de passe."));
        const pass = validatePassword(password);
        if (!pass.isValid) return reject(new Error(pass.message));
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

  exportUserData: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) return reject(new Error("Email requis pour l'export."));
        console.log(`[RGPD] Préparation de l'archive pour : ${email}`);
        resolve();
      }, 2500);
    });
  },

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
              `Conformément aux standards de sécurité actifs, vos informations de session sont chiffrées. Nous utilisons des technologies de pointe (SecureStore) pour garantir que vous seul ayez accès à vos données sensibles.\n\n` +
              `4. VOS DROITS (RGPD)\n` +
              `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez générer un export complet de vos informations ou supprimer votre compte instantanément depuis l'onglet "Légal" de vos paramètres.`
          });
        }
      }, 500);
    });
  },
};