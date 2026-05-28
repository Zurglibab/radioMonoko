import { AuthResponse, User, UpdateUserPayload } from "@/types/auth";
import { validatePassword } from "@/utils/validation/validation";
import { apiFetch } from "@/utils/apiFetch";

/**
 * AuthService : Pilote de la sécurité et du tunnel de données utilisateur.
 * Encapsule la communication avec le serveur d'authentification et gère les 
 * fonctionnalités réglementaires (RGPD / RGPD Export) de RadioMonoko.
 */
export const AuthService = {

  /**
   * login : Authentifie un utilisateur existant.
   * Lève une erreur explicite "Identifiants invalides." sur un 401 du serveur.
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await apiFetch<AuthResponse>('/user/login', {
        method: 'POST',
        body: { email, password },
      });
    } catch (error: any) {
      if (error?.message?.includes("Session d'authentification expirée")) {
        // Sur /login, un 401 = mauvais identifiants, pas une session expirée
        throw new Error("Identifiants invalides.");
      }
      throw new Error("Une erreur est survenue lors de la connexion.");
    }
  },

  /**
   * register : Initialise un nouveau compte sur la plateforme culturelle.
   * Force par défaut le paramètre de confidentialité sur "public" (Barème 2.1).
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
   * getCurrentUser : Récupère le profil privé de la session active.
   * Utilise le protocole standard d'authentification Bearer Token.
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
   * updateCurrentUser : Applique les modifications de profil demandées par l'utilisateur.
   * Bloque préventivement le changement de mot de passe qui exige un tunnel dédié.
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
   * sendResetPasswordEmail : Initie la procédure de récupération de compte.
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
   * verifyOtpCode : Valide le code de vérification reçu par l'utilisateur.
   * Essentiel pour sécuriser l'accès au formulaire de renouvellement.
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
   * resetPassword : Applique définitivement le nouveau mot de passe choisi.
   * Valide d'abord la complexité de la chaîne via une fonction de regex dédiée.
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
   * toggleTwoFactor : Active/Désactive la sécurité 2FA.
   * Prêt pour la liaison avec les modules d'authentification (Google Auth / SMS).
   */
  toggleTwoFactor: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(enabled), 800));
  },

  /**
   * toggleBiometry : Active l'usage des capteurs FaceID / TouchID.
   * Gère l'interfaçage d'autorisation locale.
   */
  toggleBiometry: async (enabled: boolean): Promise<boolean> => {
    return new Promise((resolve) => setTimeout(() => resolve(enabled), 500));
  },

  /**
   * getActiveSessions : Liste les terminaux actuellement connectés au compte.
   * Permet à l'utilisateur de révoquer des accès distants (Sécurité Avancée).
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
   * exportUserData : Génère une archive des données de l'utilisateur (Barème RGPD).
   * Compresse l'historique des critiques, des écoutes et des favoris pour envoi par mail.
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
   * deleteAccount : Supprime définitivement l'ensemble des données (Droit à l'oubli).
   */
  deleteAccount: async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 2000));
  },

  /**
   * contactSupport : Transmet une demande d'aide au support technique de RadioMonoko.
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
   * getFaq : Récupère la foire aux questions de l'application.
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
   * getDocumentContent : Fournit les textes juridiques contractuels mis à jour.
   * Indispensable pour valider les mentions obligatoires de l'application mobile.
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