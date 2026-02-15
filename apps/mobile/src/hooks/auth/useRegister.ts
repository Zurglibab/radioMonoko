import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";

/**
 * useRegister : Hook personnalisé pour gérer la création de compte.
 * Centralise les validations de formulaire et l'appel au service d'inscription.
 */
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Méthode d'inscription.
   * Effectue les vérifications de sécurité locales avant de solliciter l'API.
   */
  const register = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    agree: boolean
  ) => {
    // Tous les champs sont obligatoires, validation basique pour éviter les appels inutiles à l'API
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    // Validation de correspondance des mots de passe pour éviter les erreurs côté serveur
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    // Validation de l'acceptation des conditions d'utilisation, un prérequis pour s'inscrire
    if (!agree) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    // Début de la phase asynchrone
    setIsLoading(true);
    setError(null);

    try {
      // Tentative d'inscription via le service
      await AuthService.register(email, password);
      
      // En cas de succès, on bascule direct sur l'app
      // J'utilise replace pour ne pas pouvoir revenir au formulaire via le bouton "Back"
      router.replace("/(tabs)/home");
    } catch (err: any) {
      // Je remonte l'erreur pour l'UI
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};