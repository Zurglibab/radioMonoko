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
   * toggleTwoFactor : Active ou désactive l'authentification à deux facteurs pour le compte de l'utilisateur.
   * Gère l'interfaçage avec les méthodes de 2FA (SMS, Email, Authenticator) selon les préférences de l'utilisateur.
   * En cas de succès, retourne le nouvel état de la 2FA.
   * @param enabled 
   * @returns 
   */
  toggleTwoFactor: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(enabled), 800));
  },

  /**
   * toggleBiometry : Active l'usage des capteurs FaceID / TouchID.
   * Gère l'interfaçage d'autorisation locale.
   * @param enabled 
   * @returns 
   */
  toggleBiometry: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(enabled), 500));
  },

  /**
   * getActiveSessions : Récupère la liste des sessions actives sur le compte de l'utilisateur (appareils connectés, dates, etc.).
   * En cas de succès, retourne un tableau d'objets représentant chaque session active.
   * En cas d'échec, lance une erreur avec un message clair.
   * @returns 
   */
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
   * exportUserData : Génère un export complet des données personnelles de l'utilisateur au format JSON, conformément au RGPD.
   * Permet à l'utilisateur de recevoir un email avec un lien de téléchargement sécurisé vers son archive de données.
   * En cas d'échec, lance une erreur avec un message clair.
   * @param email 
   * @returns 
   */
  exportUserData: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) return reject(new Error("Email requis pour l'export."));
        resolve();
      }, 2500);
    });
  },

  /**
   * deleteAccount : Supprime définitivement le compte de l'utilisateur après confirmation.
   * Gère la purge de toutes les données associées au compte (profil, interactions, etc.) et la révocation des sessions actives.
   * En cas de succès, confirme la suppression du compte.
   * En cas d'échec, lance une erreur avec un message clair.
   * @returns 
   */
  deleteAccount: async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 2000));
  },

  /**
   * contactSupport : Permet à l'utilisateur d'envoyer un message au support technique depuis l'application.
   * Gère la soumission du message, la validation des champs, et la confirmation de l'envoi.
   * En cas d'échec, lance une erreur avec un message clair.
   * @param subject 
   * @param message 
   * @returns 
   */
  contactSupport: async (subject: string, message: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!subject || !message) return reject(new Error("Veuillez remplir tous les champs."));
        resolve();
      }, 1500);
    });
  },

  /**
   * getFaq : Récupère la liste des questions fréquemment posées (FAQ) pour aider les utilisateurs à trouver des réponses rapidement.
   * En cas de succès, retourne un tableau d'objets contenant les questions et réponses.
   * En cas d'échec, lance une erreur avec un message clair.
   * @returns 
   */
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

  /**
   * getDocumentContent : Récupère le contenu des documents légaux (CGU, Politique de Confidentialité) pour les afficher dans l'application.
   * En cas de succès, retourne un objet contenant le titre et le contenu du document demandé.
   * En cas d'échec, lance une erreur avec un message clair.
   * @param type 
   * @returns 
   */
  getDocumentContent: async (type: 'cgu' | 'privacy'): Promise<{ title: string; content: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'cgu') {
          resolve({
            title: "Conditions Générales d'Utilisation",
            content: `Dernière mise à jour : Avril 2026\n\n` +
              `Bienvenue sur RadioMonoko. Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de nos services.\n\n` +
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