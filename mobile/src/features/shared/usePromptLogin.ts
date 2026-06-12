import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

/**
 * usePromptLogin : Invite à se connecter/s'inscrire pour les actions réservées aux comptes.
 * Utilisé par les écrans publics (accueil, recherche, fiche station...) sur les actions
 * nécessitant un compte (favoris, statuts, collections...).
 */
export const usePromptLogin = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (action: string) => {
    Alert.alert(
      t('home.publicHome.joinCommunityTitle'),
      t('home.publicHome.joinCommunityMessage', { action }),
      [
        { text: t('home.publicHome.later'), style: "cancel" },
        {
          text: t('home.publicHome.register'),
          onPress: () => router.push("/(auth)/register"),
          style: "default"
        }
      ]
    );
  };
};
