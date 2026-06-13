import { useState } from "react";
import { AuthService } from "@/services/auth/auth.service";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

const validateLoginForm = (email: string, password: string): string | null => {
  if (!email || !password) return "Veuillez remplir tous les champs.";
  return null;
};

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
