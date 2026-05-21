import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth : Hook personnalisé orchestrant le flux de connexion.
 * Fait le pont entre l'appel API brut (AuthService) et la gestion de session globale (AuthContext).
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // On récupère la méthode login du contexte (qui prend désormais uniquement le token en paramètre)
  const { login: updateGlobalState } = useAuthContext();

  /**
   * Orchestre la procédure de connexion complète.
   * @param email Adresse mail saisie par l'utilisateur
   * @param password Mot de passe saisi par l'utilisateur
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // Normalisation de l'email : supprime les espaces et gère la casse (Majuscules/Minuscules)
    const emailCleaned = email ? email.trim().toLowerCase() : "";

    if (!emailCleaned || !password) {
      setError("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Appel HTTP vers l'API Swagger (POST /user/login) -> Renvoie { token: "string" }
      const response = await AuthService.login(emailCleaned, password);
      
      console.log("[useAuth] Jeton reçu avec succès, initialisation de la session globale...");

      // 2. On transmet le token au contexte. L'AuthContext va automatiquement interroger 
      // le endpoint GET /user/me pour hydrater l'application avec les vraies données de PostgreSQL.
      await updateGlobalState(response.token);
      
      // 3. Redirection vers l'accueil de l'application RadioMonoko
      router.replace("/(tabs)/home");
      
    } catch (err: any) {
      // Capture et centralisation des messages d'erreurs (Ex: 401 Identifiants invalides)
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};