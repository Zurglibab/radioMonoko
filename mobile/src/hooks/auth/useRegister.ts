import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { validateEmail, validatePassword } from "@/utils/validation/validation";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const MIN_USERNAME_LENGTH = 3;

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

export const useRegister = () => {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { login: updateGlobalState } = useAuthContext();

  const { triggerGoogleAuth, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    username: string,
    agree: boolean
  ) => {
    setFormError(null);
    const emailCleaned = email?.trim().toLowerCase() || "";
    const usernameCleaned = username?.trim() || "";

    const validationError = validateRegisterForm(
      emailCleaned, password, confirmPassword, usernameCleaned, agree
    );
    if (validationError) { setFormError(validationError); return; }

    setIsFormLoading(true);
    try {
      const response = await AuthService.register(emailCleaned, password, usernameCleaned);
      await updateGlobalState(response.token);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setFormError(err?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsFormLoading(false);
    }
  };

  return {
    register,
    registerWithGoogle: triggerGoogleAuth,
    isLoading: isFormLoading || isGoogleLoading,
    error: formError || googleError,
  };
};
