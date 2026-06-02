import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { validateEmail, validatePassword } from "@/utils/validation/validation";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const MIN_USERNAME_LENGTH = 3;

/**
 * Pré-valide tous les champs du formulaire d'inscription.
 * Retourne un message d'erreur localisé, ou null si tout est valide.
 */
const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  username: string,
  agree: boolean
): string | null => {
  if (!email || !password || !confirmPassword || !username) {
    return "Veuillez remplir tous les champs.";
  }
  if (!validateEmail(email)) {
    return "Veuillez entrer une adresse email valide.";
  }
  if (username.length < MIN_USERNAME_LENGTH) {
    return `Le pseudo doit contenir au moins ${MIN_USERNAME_LENGTH} caractères.`;
  }
  if (!USERNAME_REGEX.test(username)) {
    return "Le pseudo ne peut contenir que des lettres, chiffres, points, tirets et underscores.";
  }
  const passCheck = validatePassword(password);
  if (!passCheck.isValid) return passCheck.message;
  if (password !== confirmPassword) {
    return "Les mots de passe ne correspondent pas.";
  }
  if (!agree) {
    return "Vous devez accepter les conditions d'utilisation.";
  }
  return null;
};

/**
 * useRegister : Hook personnalisé orchestrant l'inscription sur RadioMonoko.
 * Gère les états de chargement, les messages d'erreur et applique une série 
 * de filtres de validation drastiques avant de solliciter le backend.
 */
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login: updateGlobalState } = useAuthContext();

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    username: string,
    agree: boolean
  ) => {
    setError(null);

    // Normalisation des champs critiques
    const emailCleaned = email?.trim().toLowerCase() || "";
    const usernameCleaned = username?.trim() || "";

    // Validation locale avant tout appel réseau
    const validationError = validateRegisterForm(
      emailCleaned, password, confirmPassword, usernameCleaned, agree
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.register(emailCleaned, password, usernameCleaned);
      await updateGlobalState(response.token);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  },

  registerWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthService.loginWithGoogle();
      await updateGlobalState(response.token);
      router.replace("/(tabs)/home");
    } catch (err:any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription avec Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, registerWithGoogle, isLoading, error };
};