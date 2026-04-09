import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import PublicHome from "@/features/home/screens/PublicHome";
import PrivateHome from "@/features/home/screens/PrivateHome";
import { theme } from "@/constants/theme";

/**
 * HomeScreen : Point d'entrée dynamique de l'onglet Accueil.
 * Gère l'aiguillage entre l'expérience "Découverte" (Public) 
 * et l'expérience "Communautaire/Perso" (Privé).
 */
export default function HomeScreen() {

  const { appearanceSettings } = useAuthContext();

  const isDark = appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;
  // On consomme l'état global pour savoir qui est là et si on est encore en train de chercher
  const { isAuthenticated, user, isLoading } = useAuthContext();

  /**
   * Écran de transition :
   * Tant que SecureStore n'a pas fini de lire le token, on bloque l'affichage.
   * C'est crucial pour éviter le PublicHome qui pourrait apparaître brièvement 
   * Avant de basculer sur le PrivateHome.
   */
  if (isLoading) {
    return (
      <View 
        className="flex-1 items-center justify-center" 
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  /**
   * Flux privé pour les utilisateurs authentifiés :
   * Si on a un utilisateur valide, on lui sert son Dashboard et son flux social.
   */
  if (isAuthenticated && user) {
    return <PrivateHome user={user} />;
  }

  /**
   * Flux public pour les visiteurs :
   * Par défaut, si aucune session n'est trouvée, on affiche le catalogue 
   * avec les incitations à l'inscription.
   */
  return <PublicHome />;
}