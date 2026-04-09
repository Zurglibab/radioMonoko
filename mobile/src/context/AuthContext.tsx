import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

/**
 * Interface AuthContextType : Définit le contrat du store global d'authentification.
 * Gère l'identité utilisateur, la sécurité, les notifications et l'apparence.
 */
interface AuthContextType {
  user: User | null;           // Données de l'utilisateur connecté
  isAuthenticated: boolean;    // Helper pour savoir si une session est active
  isLoading: boolean;          // État pendant la lecture du stockage sécurisé
  securitySettings: {
    is2FAEnabled: boolean;
    isBiometricEnabled: boolean;
  };
  notificationSettings: {
    pushDirect: boolean;
    pushPodcasts: boolean;
    pushSecurity: boolean;
  };
  appearanceSettings: {
    themeMode: 'dark' | 'light' | 'system';
    accentColor: string;
    isCompactMode: boolean;
  };
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUserData: User) => Promise<void>;
  updateSecurity: (key: 'is2FAEnabled' | 'isBiometricEnabled', value: boolean) => Promise<void>;
  updateNotifications: (key: 'pushDirect' | 'pushPodcasts' | 'pushSecurity', value: boolean) => Promise<void>;
  updateAppearance: (key: 'themeMode' | 'accentColor' | 'isCompactMode', value: string | boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider : Composant racine gérant la persistance des données utilisateur.
 * Initialisé par défaut en mode sombre (Dark First) pour respecter l'identité visuelle.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ÉTAT INITIAL : Sécurité
  const [securitySettings, setSecuritySettings] = useState({
    is2FAEnabled: false,
    isBiometricEnabled: false,
  });

  // ÉTAT INITIAL : Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    pushDirect: true,
    pushPodcasts: true,
    pushSecurity: true,
  });

  // ÉTAT INITIAL : Apparence (Impose le Dark Mode au premier lancement)
  const [appearanceSettings, setAppearanceSettings] = useState<{
    themeMode: 'dark' | 'light' | 'system';
    accentColor: string;
    isCompactMode: boolean;
  }>({
    themeMode: 'dark', // L'application démarre en noir pur OLED
    accentColor: '#FFFFFF',
    isCompactMode: false,
  });

  /**
   * REHYDRATION : Restauration des préférences et de la session au démarrage.
   * Utilise SecureStore pour garantir la confidentialité des données utilisateur.
   */
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        const storedSecurity = await SecureStore.getItemAsync('security_settings');
        if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));

        const storedNotifs = await SecureStore.getItemAsync('notification_settings');
        if (storedNotifs) setNotificationSettings(JSON.parse(storedNotifs));

        const storedAppearance = await SecureStore.getItemAsync('appearance_settings');
        if (storedAppearance) setAppearanceSettings(JSON.parse(storedAppearance));

      } catch (e) {
        console.error("Erreur lors de la récupération des préférences", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  /**
   * login : Authentifie l'utilisateur et persiste son jeton d'accès.
   */
  const login = async (userData: User, token: string) => {
    setUser(userData);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    await SecureStore.setItemAsync('token', token);
  };

  /**
   * logout : Nettoie la session locale et le stockage sécurisé.
   */
  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
  };

  /**
   * updateUser : Met à jour les informations du profil utilisateur.
   */
  const updateUser = async (newUserData: User) => {
    setUser(newUserData);
    await SecureStore.setItemAsync('user', JSON.stringify(newUserData));
  };

  /**
   * updateSecurity : Persiste les réglages de protection (2FA, Biométrie).
   */
  const updateSecurity = async (key: 'is2FAEnabled' | 'isBiometricEnabled', value: boolean) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    await SecureStore.setItemAsync('security_settings', JSON.stringify(newSettings));
  };

  /**
   * updateNotifications : Gère les préférences de réception des pushs.
   */
  const updateNotifications = async (key: 'pushDirect' | 'pushPodcasts' | 'pushSecurity', value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    await SecureStore.setItemAsync('notification_settings', JSON.stringify(newSettings));
  };

  /**
   * updateAppearance : Modifie le thème, la couleur d'accent ou la mise en page.
   */
  const updateAppearance = async (key: 'themeMode' | 'accentColor' | 'isCompactMode', value: any) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    await SecureStore.setItemAsync('appearance_settings', JSON.stringify(newSettings));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isLoading, 
      securitySettings,
      notificationSettings,
      appearanceSettings,
      login, 
      logout,
      updateUser,
      updateSecurity,
      updateNotifications,
      updateAppearance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuthContext : Custom hook pour consommer facilement le store global.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
  return context;
};