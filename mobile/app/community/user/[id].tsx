import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, UserPlus, UserCheck } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { SocialService as CommunitySocialService } from "@/services/community/social.service";
import { SocialService } from "@/services/social/social.service";

/**
 * UserProfileScreen : Écran d'affichage d'un profil tiers de la communauté.
 * Permet de visualiser l'avatar, le pseudonyme, la biographie, les compteurs 
 * relationnels et de gérer dynamiquement l'action d'abonnement.
 */
export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const isDark = appearanceSettings.themeMode === 'system' ? systemTheme === 'dark' : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Interroge le service communautaire pour extraire les métriques chaudes 
   * et froides du profil de l'utilisateur ciblé.
   */
  useEffect(() => {
    const loadProfile = async () => {
      const data = await CommunitySocialService.getUserProfile(id as string);
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  /**
   * handleFollowToggle : Gère l'action de suivi / désabonnement.
   * Réalise une mise à jour optimiste (Optimistic UI) du state local pour offrir 
   * une réactivité instantanée à l'utilisateur, tout en incrémentant/décrémentant le compteur.
   */
  const handleFollowToggle = async () => {
    if (!token) return;
    const wasFollowing = profile.isFollowing;
    setProfile({
      ...profile,
      isFollowing: !wasFollowing,
      followersCount: wasFollowing ? profile.followersCount - 1 : profile.followersCount + 1,
    });
    try {
      if (wasFollowing) {
        await SocialService.unfollowUser(token, id as string);
      } else {
        await SocialService.followUser(token, id as string);
      }
    } catch {
      setProfile((prev: typeof profile) => ({
        ...prev,
        isFollowing: wasFollowing,
        followersCount: wasFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
      }));
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Navigation retour et titre contextuel */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }} 
          className="p-2 rounded-full border active:opacity-60"
        >
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-black italic ml-4">
          Profil Public
        </Text>
      </View>

      {/* Identité de l'utilisateur */}
      <View className="px-6 items-center mt-6">
        {/* Avatar */}
        <Image 
          source={{ uri: profile.avatar }} 
          className="w-24 h-24 rounded-[32px] border-2" 
          style={{ borderColor: colors.border }} 
        />
        
        <Text style={{ color: colors.text }} className="text-2xl font-black mt-4 tracking-tighter">
          {profile.username}
        </Text>
        <Text style={{ color: colors.muted }} className="text-xs font-bold mb-4">
          {profile.email}
        </Text>
        
        {/* Biographie communautaire */}
        <Text style={{ color: colors.text }} className="text-center text-sm leading-5 px-4 mb-6 opacity-80">
          {profile.bio}
        </Text>

        {/* Abonnés et abonnements */}
        <View className="flex-row gap-x-6 mb-6">
          <Text style={{ color: colors.text }} className="text-sm font-bold">
            {profile.followingCount}{" "}
            <Text style={{ color: colors.muted }} className="font-normal text-xs">
              Abonnements
            </Text>
          </Text>
          <Text style={{ color: colors.text }} className="text-sm font-bold">
            {profile.followersCount}{" "}
            <Text style={{ color: colors.muted }} className="font-normal text-xs">
              Abonnés
            </Text>
          </Text>
        </View>

        {/* Inversion intelligente de la charte de couleurs */}
        <TouchableOpacity 
          onPress={handleFollowToggle}
          style={{ 
            backgroundColor: profile.isFollowing ? colors.surface : colors.text, 
            borderColor: colors.border 
          }}
          className="w-full h-12 rounded-full flex-row items-center justify-center border shadow-sm active:scale-[0.99]"
        >
          {profile.isFollowing ? (
            <>
              <UserCheck size={16} color={colors.text} />
              <Text style={{ color: colors.text }} className="font-black uppercase text-xs ml-2 tracking-widest">
                Abonné
              </Text>
            </>
          ) : (
            <>
              {/* Non abonné */}
              <UserPlus size={16} color={colors.background} />
              <Text style={{ color: colors.background }} className="font-black uppercase text-xs ml-2 tracking-widest">
                Suivre
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}