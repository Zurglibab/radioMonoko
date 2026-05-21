import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { validateEmail, validatePassword } from "@/utils/validation/validation";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";

/**
 * useRegister : Hook personnalisé orchestrant l'inscription sur RadioMonoko.
 * Gère les états de chargement, les messages d'erreur et applique une série 
 * de filtres de validation drastiques avant de solliciter le backend.
 */
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Consommation du contexte global pour persister le token de session dès la création réussie
  const { login: updateGlobalState } = useAuthContext();

  /**
   * register : Traite la demande de création de compte.
   * Nettoie les entrées, valide les structures et communique avec le service d'authentification.
   */
  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    username: string,
    agree: boolean
  ) => {
    // Réinitialisation d'une éventuelle erreur précédente
    setError(null);
    // Nettoyage et normalisation des champs critiques (email, username) pour éviter les erreurs de format et les attaques d'injection
    const emailCleaned = email ? email.trim().toLowerCase() : "";
    const usernameCleaned = username ? username.trim() : "";
    // Validation de la complétude des champs (non-vide) avant toute autre vérification
    if (!emailCleaned || !password || !confirmPassword || !usernameCleaned) {
      return setError("Veuillez remplir tous les champs.");
    }
    // Validation de la structure de l'email via une expression régulière stricte
    if (!validateEmail(emailCleaned)) {
      return setError("Veuillez entrer une adresse email valide.");
    }
    // Validation de la longueur et des caractères autorisés pour le pseudo
    if (usernameCleaned.length < 3) {
      return setError("Le pseudo doit contenir au moins 3 caractères.");
    }
    // Sécurisation alphanumérique contre les injections de caractères spéciaux malicieux
    if (!/^[a-zA-Z0-9_.-]+$/.test(usernameCleaned)) {
      return setError("Le pseudo ne peut contenir que des lettres, chiffres, points, tirets et underscores.");
    }
    // Validation de la robustesse du mot de passe via l'utilitaire dédié
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) return setError(passCheck.message);
    // Validation de la correspondance entre le mot de passe et sa confirmation
    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }
    // Validation finale de l'acceptation des CGU (RGPD)
    if (!agree) {
      return setError("Vous devez accepter les conditions d'utilisation.");
    }
    setIsLoading(true);
    try {
      // Soumission asynchrone au serveur HTTP via le service
      const response = await AuthService.register(emailCleaned, password, usernameCleaned);
      // Injection immédiate du token d'accès dans le SecureStore / Contexte
      await updateGlobalState(response.token);
      // Redirection de l'utilisateur vers l'espace applicatif privé
      router.replace("/(tabs)/home");
    } catch (err: any) {
      // Captation propre de l'erreur levée par le service (ex: 400 - Utilisateur déjà existant)
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      // Extinction systématique du loader, même en cas d'échec
      setIsLoading(false);
    }
  };

  return { 
    register,
    isLoading,
    error 
  };
};