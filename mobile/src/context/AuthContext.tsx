import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, UpdateUserPayload } from '@/types/auth';
import { AuthService } from '@/services/auth/auth.service';

/**
 * Interfaces pour les réglages additionnels de l'application
 */
interface SecuritySettings {
  is2FAEnabled: boolean;
  isBiometricEnabled: boolean;
}

interface NotificationSettings {
  pushDirect: boolean;
  pushPodcasts: boolean;
  pushSecurity: boolean;
}

interface AppearanceSettings {
  themeMode: 'dark' | 'light' | 'system';
  accentColor: string;
  isCompactMode: boolean;
}

/**
 * Interface contractuelle complète du state global d'authentification et de configuration
 */
interface AuthContextType {
  user: User | null;          
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
  appearanceSettings: AppearanceSettings;
  login: (userToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: UpdateUserPayload) => Promise<void>;
  updateSecurity: (key: keyof SecuritySettings, value: boolean) => Promise<void>;
  updateNotifications: (key: keyof NotificationSettings, value: boolean) => Promise<void>;
  updateAppearance: (key: keyof AppearanceSettings, value: string | boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Etats locaux pour les préférences utilisateur (sécurité, notifications, apparence)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    is2FAEnabled: false,
    isBiometricEnabled: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushDirect: true,
    pushPodcasts: true,
    pushSecurity: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    themeMode: 'dark',
    accentColor: '#FFFFFF',
    isCompactMode: false,
  });

  /**
   * Initialisation de la session utilisateur au lancement de l'application
   * - Récupère le token stocké et hydrate le profil utilisateur depuis le backend
   * - Charge les préférences utilisateur locales (sécurité, notifications, apparence)
   * - Gère les erreurs de récupération (token corrompu, données expirées) en nettoyant la session
   */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Récupération du token et hydratation utilisateur
        const storedToken = await SecureStore.getItemAsync('user_token');
        if (storedToken) {
          const dbUser = await AuthService.getCurrentUser(storedToken);
          setToken(storedToken);
          setUser(dbUser);
        }

        // Récupération des préférences utilisateur locales
        const storedSecurity = await SecureStore.getItemAsync('security_settings');
        if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));

        const storedNotifs = await SecureStore.getItemAsync('notification_settings');
        if (storedNotifs) setNotificationSettings(JSON.parse(storedNotifs));

        const storedAppearance = await SecureStore.getItemAsync('appearance_settings');
        if (storedAppearance) setAppearanceSettings(JSON.parse(storedAppearance));

      } catch (error) {
        console.error("[AuthContext] Échec du chargement de la session initiale :", error);
        // Si le token ou les données sont corrompus/expirés, nettoyage de sécurité
        await SecureStore.deleteItemAsync('user_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  /**
   * Procédure d'authentification globale (POST /user/login ou POST /user/register)
   */
  const login = async (userToken: string) => {
    try {
      const dbUser = await AuthService.getCurrentUser(userToken);
      setToken(userToken);
      setUser(dbUser);
      await SecureStore.setItemAsync('user_token', userToken);
    } catch (error) {
      console.error("[AuthContext] Erreur lors de l'initialisation du login :", error);
      throw error;
    }
  };

  /**
   * Déconnexion complète
   */
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await SecureStore.deleteItemAsync('user_token');
    } catch (error) {
      console.error("[AuthContext] Erreur lors de la déconnexion :", error);
    }
  };

  /**
   * Forcer un rafraîchissement des infos (GET /user/me)
   */
  const refreshProfile = async () => {
    if (!token) return;
    try {
      const freshUser = await AuthService.getCurrentUser(token);
      setUser(freshUser);
    } catch (error) {
      console.error("[AuthContext] Impossible de rafraîchir le profil :", error);
    }
  };

  /**
   * Met à jour le profil de l'utilisateur sur le serveur (PUT /user/me)
   */
  const updateProfile = async (payload: UpdateUserPayload) => {
    if (!token) throw new Error("Aucun jeton d'authentification valide trouvé.");
    try {
      const updatedUser = await AuthService.updateCurrentUser(token, payload);
      setUser(updatedUser);
    } catch (error) {
      console.error("[AuthContext] Erreur lors de la mise à jour du profil :", error);
      throw error;
    }
  };

  /**
   * Persistance locale des réglages de sécurité
   */
  const updateSecurity = async (key: keyof SecuritySettings, value: boolean) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    await SecureStore.setItemAsync('security_settings', JSON.stringify(newSettings));
  };

  /**
   * Persistance locale des préférences de notifications
   */
  const updateNotifications = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    await SecureStore.setItemAsync('notification_settings', JSON.stringify(newSettings));
  };

  /**
   * Persistance locale des réglages d'apparence (Thème)
   */
  const updateAppearance = async (key: keyof AppearanceSettings, value: any) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    await SecureStore.setItemAsync('appearance_settings', JSON.stringify(newSettings));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!user, 
      isLoading, 
      securitySettings,
      notificationSettings,
      appearanceSettings,
      login, 
      logout,
      refreshProfile,
      updateProfile,
      updateSecurity,
      updateNotifications,
      updateAppearance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};