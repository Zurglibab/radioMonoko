import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { Station } from "@/types/content";
import { UpdateUserPayload } from "@/types/auth";
import { useAuthContext } from "@/context/AuthContext";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useMyStatuses } from "@/hooks/content/useMyStatuses";
import { useCollections } from "@/hooks/collections/useCollections";

/**
 * useLibrary : Hook centralisé pour la gestion de la bibliothèque utilisateur.
 * 
 * Ce hook regroupe la logique de gestion des favoris, des statuts de contenus et des playlists
 * de l'utilisateur connecté. Il fournit une interface unifiée pour accéder à ces données,
 * ainsi que des fonctions pour les manipuler (ex: toggleFavorite, refetch, etc.).
 * @returns 
 */
export const useLibrary = () => {
  const { token, user: authUser, logout: authLogout, updateProfile: authUpdateProfile } = useAuthContext();

  const {
    favorites: realFavorites,
    isLoading: isFavoritesLoading,
    toggleFavorite: realToggleFavorite,
    refetch: refetchFavorites,
    isFavoriteByContentId
  } = useFavorites(true);

  const {
    statuses,
    statusCounts,
    getByFrontStatus,
    isLoading: isStatusesLoading,
    refetch: refetchStatuses,
  } = useMyStatuses(true);

  const { collections, isLoading: isCollectionsLoading, refetch: refetchCollections } = useCollections(true);
  const [activeTab, setActiveTab] = useState<'Tout' | 'Radios' | 'Podcasts' | 'Playlists'>('Tout');

  const toggleFavorite = async (station: Station) => {
    try {
      const isNowFavorite = await realToggleFavorite(station);
      Alert.alert(
        "Favoris",
        isNowFavorite ? "Ajouté à vos Titres Likés" : "Retiré de vos Titres Likés"
      );
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de modifier le favori.");
    }
  };

  const checkDisplayNameCooldown = () => {
    if (!authUser?.lastUsernameChange) return { allowed: true, remainingDays: 0 };
    const lastChange = new Date(authUser.lastUsernameChange).getTime();
    const now = Date.now();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);

    if (diffDays < 14) {
      return { allowed: false, remainingDays: Math.ceil(14 - diffDays) };
    }
    return { allowed: true, remainingDays: 0 };
  };

  const updateProfile = async (payload: UpdateUserPayload) => {
    if (!authUser) return;
    try {
      await authUpdateProfile(payload);
      Alert.alert("Succès", "Profil mis à jour !");
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de mettre à jour le profil.");
    }
  };

  const mappedPlaylists = useMemo(() => {
    return collections.map(col => ({
      id: col.id,
      name: col.name,
      creator: "Vous",
      description: col.description || "Sans description",
      coverImage: "", 
      items: [], 
      isPublic: col.is_public,
      isCollaborative: false,
      createdAt: col.created_at
    }));
  }, [collections]);

  return {
    token,
    user: authUser,
    logout: authLogout,
    updateProfile,
    checkDisplayNameCooldown,
    activeTab,
    setActiveTab,

    // Statuts
    statuses,
    statusItems: statusCounts,
    getByFrontStatus,
    isStatusesLoading,
    refetchStatuses,

    // Favoris
    favorites: realFavorites,
    isFavoritesLoading,
    refetchFavorites,
    toggleFavorite,
    isFavoriteByContentId,

    // Playlists stabilisées
    playlists: mappedPlaylists,
    isCollectionsLoading,
    refetchCollections
  };
};