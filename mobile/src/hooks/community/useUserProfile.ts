import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { UserService, PublicUserProfile } from "@/services/users/user.service";
import { SocialService } from "@/services/social/social.service";
import { CollectionService } from "@/services/collections/collection.service";
import { Friend } from "@/types/social";
import { CollectionDTO } from "@/types/collection";

const followCache = new Map<string, boolean>();

export interface UserProfileState {
  profile: PublicUserProfile | null;
  targetFriendsCount: number;
  mutualFriends: Friend[];
  collections: CollectionDTO[];
  isFollowing: boolean;
}

/**
 * useUserProfile : Hook personnalisé pour gérer l'affichage du profil utilisateur.
 * Il récupère les informations du profil, les amis en commun, et les collections publiques.
 * @returns Un objet contenant les données du profil et les fonctions de gestion.
 */
export const useUserProfile = () => {
  const { id, username: usernameParam } = useLocalSearchParams<{ id: string; username?: string }>();
  const router = useRouter();
  const { token, user: currentUser } = useAuthContext();

  const [state, setState] = useState<UserProfileState>({
    profile: null,
    targetFriendsCount: 0,
    mutualFriends: [],
    collections: [],
    isFollowing: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("Identifiant manquant.");
      return;
    }
    if (!token) {
      setIsLoading(false);
      setError("Connexion requise.");
      return;
    }

    setIsLoading(true);

    Promise.all([
      UserService.getById(token, id).catch((e) => {
        if (__DEV__) console.warn("[UserProfile] getById failed:", e?.message);
        if (usernameParam) return { id, username: usernameParam } as PublicUserProfile;
        return null;
      }),
      SocialService.fetchUserFriends(token, id).catch(() => [] as Friend[]),
      SocialService.fetchMyFollowing(token).catch(() => [] as Friend[]),
      SocialService.fetchMyFriends(token).catch(() => [] as Friend[]),
      CollectionService.getUserCollections(token, id).catch(() => [] as CollectionDTO[]),
    ])
      .then(([profile, targetFriends, myFollowing, myFriends, collections]) => {
        if (!profile) { setError("Profil introuvable."); return; }

        const mutualFriends = targetFriends.filter((tf) =>
          myFriends.some((mf) => mf.id === tf.id)
        );
        const backendFollowing = myFollowing.some((f) => f.id === id);
        const isFollowing = followCache.has(id) ? followCache.get(id)! : backendFollowing;
        const publicCollections = collections.filter((c) => c.is_public);

        setState({ profile, targetFriendsCount: targetFriends.length, mutualFriends, collections: publicCollections, isFollowing });
      })
      .catch(() => setError("Impossible de charger ce profil."))
      .finally(() => setIsLoading(false));
  }, [id, token]);

  const handleFollowToggle = async () => {
    if (!token || isFollowLoading) return;
    const wasFollowing = state.isFollowing;
    setIsFollowLoading(true);
    setState((prev) => ({ ...prev, isFollowing: !wasFollowing }));
    try {
      if (wasFollowing) {
        await SocialService.unfollowUser(token, id);
      } else {
        await SocialService.followUser(token, id);
      }
      followCache.set(id, !wasFollowing);
    } catch (e: any) {
      if (!wasFollowing && e?.message === "HTTP 400") {
        followCache.set(id, true);
        setState((prev) => ({ ...prev, isFollowing: true }));
      } else {
        followCache.delete(id);
        setState((prev) => ({ ...prev, isFollowing: wasFollowing }));
      }
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleBlock = () => {
    if (!token || !state.profile) return;
    const name = state.profile.display_name ?? state.profile.username;
    Alert.alert(
      "Bloquer cet utilisateur",
      `Voulez-vous bloquer ${name} ? Cette action rompra toute relation existante.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Bloquer",
          style: "destructive",
          onPress: async () => {
            setIsBlocking(true);
            try {
              await SocialService.blockUser(token, id);
              followCache.delete(id);
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de bloquer cet utilisateur.");
            } finally {
              setIsBlocking(false);
            }
          },
        },
      ]
    );
  };

  const openOptions = () => {
    Alert.alert("Options", undefined, [
      { text: "Bloquer cet utilisateur", style: "destructive", onPress: handleBlock },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return {
    id,
    state,
    isLoading,
    error,
    isFollowLoading,
    isBlocking,
    isOwnProfile,
    handleFollowToggle,
    openOptions,
  };
};
