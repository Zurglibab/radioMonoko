import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

WebBrowser.maybeCompleteAuthSession();

const NATIVE_REDIRECT_URI = Platform.select({
  ios: "com.googleusercontent.apps.854362312297-6s78m7j9kmar35pcc5lf9rnrj5agsi72:/oauth2redirect",
  android: "com.googleusercontent.apps.854362312297-b2he06fmomo8eklirs3nsiv95o83m13d:/oauth2redirect",
});

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login: updateGlobalState } = useAuthContext();

  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
    redirectUri: NATIVE_REDIRECT_URI,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "error") {
      setError("Erreur Google OAuth.");
      setIsLoading(false);
      return;
    }

    if (response.type !== "success") {
      setIsLoading(false);
      return;
    }

    if (response.params?.code && !response.authentication) return;

    const googleToken =
      response.authentication?.idToken ?? response.authentication?.accessToken;

    if (!googleToken) {
      setError("Token Google introuvable. Réessaie.");
      setIsLoading(false);
      return;
    }

    AuthService.loginWithGoogleToken(googleToken)
      .then(async (res) => {
        await updateGlobalState(res.token);
        router.replace("/(tabs)/home");
      })
      .catch((err: any) => {
        setError(err?.message ?? "Connexion Google impossible.");
      })
      .finally(() => setIsLoading(false));
  }, [response]);

  const triggerGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") {
        setIsLoading(false);
      }
    } catch {
      setError("Connexion Google impossible.");
      setIsLoading(false);
    }
  };

  return { triggerGoogleAuth, isLoading, error };
};
