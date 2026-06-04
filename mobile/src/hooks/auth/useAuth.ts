import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Pré-valide les champs du formulaire de connexion.
 * Retourne un message d'erreur localisé, ou null si tout est valide.
 */
const validateLoginForm = (email: string, password: string): string | null => {
  if (!email || !password) {
    return "Veuillez remplir tous les champs.";
  }
  return null;
};

/**
 * useAuth : Hook personnalisé orchestrant le flux de connexion.
 * Fait le pont entre l'appel API brut (AuthService) et la gestion de session globale (AuthContext).
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Méthode login du contexte global (prend uniquement un token en paramètre).
  const { login: updateGlobalState } = useAuthContext();

  /**
   * Orchestre la procédure de connexion complète :
   * 1. Validation locale des champs
   * 2. Appel à l'API d'authentification (POST /user/login)
   * 3. Hydratation du contexte global (qui interroge GET /user/me)
   * 4. Redirection vers l'accueil
   */
  const login = async (email: string, password: string) => {
    setError(null);

    // Normalisation de l'email : suppression des espaces et harmonisation de la casse
    const emailCleaned = email?.trim().toLowerCase() || "";

    // Validation locale avant tout appel réseau
    const validationError = validateLoginForm(emailCleaned, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.login(emailCleaned, password);

      if (__DEV__) {
        console.log("[useAuth] Jeton reçu, initialisation de la session globale...");
      }

      await updateGlobalState(response.token);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthService.loginWithGoogle();
      await updateGlobalState(response.token);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Connexion Google impossible.");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, loginWithGoogle, isLoading, error };
};