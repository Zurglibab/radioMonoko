import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";

/**
 * useAuth : Hook personnalisé pour centraliser la logique d'authentification.
 * Permet de gérer les états de chargement, les erreurs et la navigation de manière réutilisable dans toute l'application.
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Méthode de connexion.
   * Encapsule l'appel au service et gère les redirections post-connexion.
   */
  const login = async (email: string, password: string) => {
    // Reset de l'état avant chaque tentative pour éviter les feedbacks erronés
    setIsLoading(true);
    setError(null);

    try {
      // Appel au service d'authentification pour tenter de connecter l'utilisateur
      const response = await AuthService.login(email, password);
      console.log("Connecté :", response.user.username);

      // Je redirige vers le dashboard principal en replace 
      // pour empêcher le retour en arrière vers le formulaire
      router.replace("/(tabs)/home");
    } catch (err: any) {
      // Je capture le message d'erreur pour l'afficher dans le composant UI
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      // Le chargement se termine quoi qu'il arrive (succès ou échec)
      setIsLoading(false);
    }
  };

  // J'expose uniquement ce dont les composants ont besoin
  return { login, isLoading, error };
};