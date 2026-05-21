import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { validateEmail } from "@/utils/validation/validation";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";

/**
 * useRegister : Hook personnalisé orchestrant le flux d'inscription.
 * Gère les validations de sécurité locales avant de soumettre les données à l'API.
 */
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // On récupère la méthode globale du contexte pour connecter automatiquement l'utilisateur
  const { login: updateGlobalState } = useAuthContext();

  /**
   * Méthode d'inscription.
   * @param email Adresse email saisie
   * @param password Mot de passe choisi
   * @param confirmPassword Confirmation du mot de passe
   * @param agree Statut d'acceptation des CGU
   */
  const register = async (email: string, password: string, confirmPassword: string, agree: boolean) => {
    setError(null);

    // Normalisation de l'email (nettoyage des espaces involontaires et de la casse)
    const emailCleaned = email ? email.trim().toLowerCase() : "";

    // Validations locales d'intégrité du formulaire
    if (!emailCleaned || !password || !confirmPassword) return setError("Veuillez remplir tous les champs.");
    if (!validateEmail(emailCleaned)) return setError("Veuillez entrer une adresse email valide.");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas.");
    if (!agree) return setError("Vous devez accepter les conditions d'utilisation.");

    setIsLoading(true);

    try {
      // Appel à l'API d'inscription. En cas de succès, un token JWT est retourné.
      const response = await AuthService.register(emailCleaned, password);
      
      console.log("[useRegister] Compte créé en BDD avec succès, initialisation de la session...");

      // Traitement post-inscription :
      // Met à jour le state global d'authentification avec le token reçu pour connecter l'utilisateur immédiatement
      await updateGlobalState(response.token);
      
      // Redirection vers l'écran d'accueil après une inscription réussie
      router.replace("/(tabs)/home");
    } catch (err: any) {
      // Gestion des erreurs d'inscription (ex: email déjà utilisé, problèmes de réseau, etc.)
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};