import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth : Hook personnalisé.
 * Il fait le pont entre l'appel API (AuthService) et le stockage persistant (AuthContext).
 * C'est ici que l'on gère les états éphémères (loading, erreurs locales).
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Je récupère la méthode du contexte global pour sauvegarder la session
  // Renommage pour éviter la confusion avec la fonction login locale
  const { login: updateGlobalState } = useAuthContext();

  /**
   * login : Orchestre la procédure de connexion complète.
   */
  const login = async (email: string, password: string) => {
    // Je reset les états locaux avant de commencer
    setIsLoading(true);
    setError(null);

    try {
      // J'appelle le service d'authentification pour obtenir l'user et le token
      const response = await AuthService.login(email, password);
      
      console.log("Succès API, mise à jour du contexte...");

      // Je mets à jour le contexte global avec les données reçues de l'API
      await updateGlobalState(response.user, response.token);

      // Je navigue vers l'écran principal de l'application
      // replace() empêche de revenir au formulaire de login via le bouton retour du téléphone
      router.replace("/(tabs)/home");
      
    } catch (err: any) {
      // En cas d'erreur, je capture le message et le stocke dans l'état local pour l'afficher à l'utilisateur
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      // Toujours libérer l'UI à la fin du processus
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};