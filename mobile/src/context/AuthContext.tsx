import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, UpdateUserPayload } from '@/types/auth';
import { AuthService } from '@/services/auth/auth.service';

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

/**
 * Helper : détecte les erreurs liées à une session invalide/expirée
 * pour déclencher un logout automatique de manière cohérente.
 */
const isSessionError = (error: any): boolean => {
  const msg = error?.message || '';
  return (
    msg.includes('Session expirée') ||
    msg.includes("Session d'authentification expirée") ||
    msg.includes('Utilisateur non trouvé')
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
   * Récupère à la volée les préférences (apparence, sécurité, notifications) stockées sur l'appareil.
   * Échec silencieux : on garde les valeurs par défaut si la lecture échoue.
   */
  const loadLocalSettings = useCallback(async () => {
    try {
      const [storedSecurity, storedNotifs, storedAppearance] = await Promise.all([
        SecureStore.getItemAsync('security_settings'),
        SecureStore.getItemAsync('notification_settings'),
        SecureStore.getItemAsync('appearance_settings'),
      ]);

      if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));
      if (storedNotifs) setNotificationSettings(JSON.parse(storedNotifs));
      if (storedAppearance) setAppearanceSettings(JSON.parse(storedAppearance));
    } catch (e) {
      if (__DEV__) console.warn("[AuthContext] Impossible de charger les préférences locales :", e);
    }
  }, []);

  /**
   * Déconnexion complète : purge l'état mémoire et le token persistant.
   */
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    try {
      await SecureStore.deleteItemAsync('user_token');
    } catch (error) {
      if (__DEV__) console.warn("[AuthContext] Erreur lors de la suppression du token :", error);
    }
  }, []);

  /**
   * Initialisation de la session au lancement de l'application.
   * Hydrate les préférences immédiatement, puis tente de restaurer la session via le token persistant.
   */
  useEffect(() => {
    const initializeSession = async () => {
      // Charger d'abord les préférences locales pour un affichage immédiat et fluide
      await loadLocalSettings();

      try {
        const storedToken = await SecureStore.getItemAsync('user_token');
        if (!storedToken) return;

        // Validation du token via /user/me (le serveur peut l'avoir invalidé entre-temps)
        const dbUser = await AuthService.getCurrentUser(storedToken);
        setToken(storedToken);
        setUser(dbUser);
      } catch (error: any) {
        if (__DEV__) console.warn("[AuthContext] Session initiale non restaurée :", error?.message);
        // Token corrompu ou expiré : on purge pour repartir d'un état propre
        if (isSessionError(error)) {
          await SecureStore.deleteItemAsync('user_token').catch(() => {});
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [loadLocalSettings]);

  /**
   * Connexion globale : valide le token contre /user/me, persiste, puis hydrate les préférences.
   */
  const login = useCallback(async (userToken: string) => {
    const dbUser = await AuthService.getCurrentUser(userToken);
    setToken(userToken);
    setUser(dbUser);
    await SecureStore.setItemAsync('user_token', userToken);
    await loadLocalSettings();
  }, [loadLocalSettings]);

  /**
   * Force un rafraîchissement du profil utilisateur depuis la base de données (GET /user/me).
   * En cas de session expirée, déconnecte automatiquement l'utilisateur.
   */
  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const freshUser = await AuthService.getCurrentUser(token);
      setUser(freshUser);
    } catch (error: any) {
      if (isSessionError(error)) await logout();
    }
  }, [token, logout]);

  /**
   * Met à jour le profil public et les métadonnées de l'utilisateur (PUT /user/me).
   * Clés valides du Swagger : display_name, avatar, bio, website, privacy.
   */
  const updateProfile = useCallback(async (payload: UpdateUserPayload) => {
    if (!token) throw new Error("Aucun jeton d'authentification valide trouvé.");
    try {
      const updatedUser = await AuthService.updateCurrentUser(token, payload);
      setUser(updatedUser);
    } catch (error: any) {
      if (isSessionError(error)) await logout();
      throw error;
    }
  }, [token, logout]);

  /**
   * Persistance locale des réglages de sécurité (2FA, Biométrie).
   */
  const updateSecurity = useCallback(async (key: keyof SecuritySettings, value: boolean) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    await SecureStore.setItemAsync('security_settings', JSON.stringify(newSettings));
  }, [securitySettings]);

  /**
   * Persistance locale des préférences de réception des notifications push.
   */
  const updateNotifications = useCallback(async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    await SecureStore.setItemAsync('notification_settings', JSON.stringify(newSettings));
  }, [notificationSettings]);

  /**
   * Persistance locale instantanée des réglages graphiques (thèmes, couleurs).
   */
  const updateAppearance = useCallback(async (key: keyof AppearanceSettings, value: any) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    await SecureStore.setItemAsync('appearance_settings', JSON.stringify(newSettings));
  }, [appearanceSettings]);

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
      updateAppearance,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
  return context;
};