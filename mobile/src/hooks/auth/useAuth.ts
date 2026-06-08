import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

const validateLoginForm = (email: string, password: string): string | null => {
  if (!email || !password) return "Veuillez remplir tous les champs.";
  return null;
};

/**
 * 
 * useAuth : Hook personnalisé pour gérer l'authentification des utilisateurs.
 * Il gère la validation du formulaire de connexion, l'appel au service d'authentification pour obtenir un token,
 * la mise à jour du contexte global d'authentification, et la navigation vers l'écran d'accueil après une connexion réussie.
 * Il intègre également l'option de connexion via Google OAuth en utilisant le hook useGoogleAuth.
 * @returns Un objet contenant les fonctions de connexion (email/mot de passe et Google), les états de chargement et d'erreur.
 */
export const useAuth = () => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { login: updateGlobalState } = useAuthContext();

  const { triggerGoogleAuth, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();

  const login = async (email: string, password: string) => {
    setFormError(null);
    const emailCleaned = email?.trim().toLowerCase() || "";
    const validationError = validateLoginForm(emailCleaned, password);
    if (validationError) { setFormError(validationError); return; }

    setIsFormLoading(true);
    try {
      const res = await AuthService.login(emailCleaned, password);
      if (__DEV__) console.log("[useAuth] Jeton reçu, initialisation de la session globale...");
      await updateGlobalState(res.token);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setFormError(err?.message || "Une erreur inconnue est survenue.");
    } finally {
      setIsFormLoading(false);
    }
  };

  return {
    login,
    loginWithGoogle: triggerGoogleAuth,
    isLoading: isFormLoading || isGoogleLoading,
    error: formError || googleError,
  };
};
