import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';

/**
 * Interface AuthContextType : Définit le contrat du store global d'authentification.
 * Expose l'état de l'utilisateur et les méthodes pour modifier cet état.
 */
interface AuthContextType {
  user: User | null;           // Données de l'utilisateur connecté
  isAuthenticated: boolean;    // Helper dérivé pour savoir si on est loggé
  isLoading: boolean;          // État pendant la lecture du stockage sécurisé
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider : Composant racine qui enveloppe l'application.
 * Il gère la logique de récupération de la session sauvegardée au démarrage.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effet de démarrage : Vérification de la présence d'une session existante.
   * C'est ce qui évite à l'utilisateur de se reconnecter à chaque ouverture.
   */
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        // On récupère la chaîne JSON stockée de manière sécurisée
        const storedUser = await SecureStore.getItemAsync('user');
        
        if (storedUser && storedUser !== "") {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Erreur critique lors du chargement de la session", e);
        setUser(null);
      } finally {
        // Une fois la vérification faite (succès ou échec), on libère l'app
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  /**
   * Action de Login : Met à jour l'état local et persiste les données sur le disque.
   */
  const login = async (userData: User, token: string) => {
    setUser(userData);
    // Je sépare l'User (pour l'UI) du Token (pour les appels API futurs)
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    await SecureStore.setItemAsync('token', token);
  };

  /**
   * Action de Logout : Nettoie l'état et supprime les traces du stockage.
   */
  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, // Cast en booléen (si user existe, true)
      isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook useAuthContext - Pour consommer le contexte facilement.
 * Sécurité supplémentaire : lance une erreur si utilisé hors du Provider.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
  return context;
};