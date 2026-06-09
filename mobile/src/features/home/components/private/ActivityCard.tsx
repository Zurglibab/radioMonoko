import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, useColorScheme, Image } from "react-native";
import { Star, Heart, MessageSquare, MoreVertical, UserPlus, UserCheck } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { SocialActivity } from "@/types/community";
import { useRouter } from "expo-router";
import { SocialService } from "@/services/social/social.service";
import { LikeReviewService } from "@/services/reviews/likeReview.service";
import { NotificationService } from "@/services/notifications/notification.service";

/**
 * ActivityCard : Composant central du fil d'actualité.
 * Affiche les interactions sociales, permet de liker, commenter 
 * et suivre l'utilisateur directement depuis le flux.
 */
export const ActivityCard = ({ activity }: { activity: SocialActivity }) => {
  const router = useRouter();
  const { token, user, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const [isLiked, setIsLiked] = useState(activity.hasLiked ?? false);
  const [likesCount, setLikesCount] = useState(activity.likes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (!isLiking) {
      setLikesCount(activity.likes);
      setIsLiked(activity.hasLiked ?? false);
    }
  }, [activity.likes, activity.hasLiked]);

  const handleLike = async () => {
    if (!token || !user?.id || isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      if (wasLiked) {
        await LikeReviewService.remove(token, activity.id, user.id);
      } else {
        await LikeReviewService.upsert(token, activity.id, user.id, true);
        if (activity.userId !== user.id) {
          NotificationService.create(token, {
            user_id: activity.userId,
            type: 'like',
            message: `${user.username ?? 'Quelqu\'un'} a aimé votre critique de ${activity.targetMedia}`,
            is_read: false,
          }).catch(() => {});
        }
      }
    } catch (err) {
      if (__DEV__) console.warn('[ActivityCard] like failed:', err);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!token) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await SocialService.unfollowUser(token, activity.userId);
      } else {
        await SocialService.followUser(token, activity.userId);
      }
    } catch {
      setIsFollowing(wasFollowing);
    }
  };

  /**
   * handleReport : Système de modération
   * Permet aux utilisateurs de signaler un contenu inapproprié.
   */
  const handleReport = () => {
    Alert.alert(
      "Modération", 
      "Signaler ce contenu pour non-respect de la charte ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Signaler", 
          style: "destructive", 
          onPress: () => Alert.alert("Merci", "Le contenu a été envoyé aux administrateurs.") 
        }
      ]
    );
  };

  return (
    <View 
      className="p-5 rounded-[24px] border mb-4 shadow-sm"
      style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }}
    >
      {/* Infos Utilisateur & Action Follow */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          {/* Avatar ou Initiale */}
          <View 
            style={{ backgroundColor: colors.background, borderColor: colors.border }}
            className="w-10 h-10 rounded-full items-center justify-center mr-3 border overflow-hidden"
          >
            {activity.avatar ? (
              <Image source={{ uri: activity.avatar }} className="w-full h-full" />
            ) : (
              <Text style={{ color: colors.text }} className="font-black uppercase text-xs">
                {activity.user[0]}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text style={{ color: colors.text }} className="font-black text-[14px]">
              {activity.user}
            </Text>
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
              {activity.timestamp}
            </Text>
          </View>
        </View>

        {/* Bouton Follow */}
        <TouchableOpacity 
          onPress={handleFollow}
          className="mr-3 px-3 py-1.5 rounded-full border"
          style={{ 
            backgroundColor: isFollowing ? colors.text : 'transparent',
            borderColor: colors.border 
          }}
        >
          {isFollowing ? (
            <UserCheck size={14} color={colors.background} />
          ) : (
            <UserPlus size={14} color={colors.text} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReport} hitSlop={20}>
          <MoreVertical size={16} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Action sur le média */}
      <View className="mb-4">
        <Text style={{ color: colors.muted }} className="text-[13px] leading-4 mb-2">
           {activity.type === 'REVIEW' ? 'A publié une critique sur ' : 'A noté '}
           <Text style={{ color: colors.text }} className="font-bold italic">
             {activity.targetMedia}
           </Text>
        </Text>

        {/* Note si applicable */}
        {(activity.type === 'RATING' || activity.value) && (
          <View className="flex-row mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star 
                key={i} 
                size={12} 
                color={i <= (activity.value || 0) ? colors.warning : colors.border} 
                fill={i <= (activity.value || 0) ? colors.warning : "transparent"} 
                className="mr-0.5"
              />
            ))}
          </View>
        )}

        {/* Texte de la critique */}
        {activity.text && (
          <Text 
            style={{ color: colors.text }} 
            className="text-[14px] leading-5 opacity-90 italic"
          >
            "{activity.text}"
          </Text>
        )}
      </View>
      
      {/* Interactions (Likes & Commentaires) */}
      <View 
        className="flex-row gap-x-6 pt-4 border-t" 
        style={{ borderColor: colors.border }}
      >
        <TouchableOpacity onPress={handleLike} disabled={isLiking} className="flex-row items-center">
          <Heart 
            size={16} 
            color={isLiked ? colors.live : colors.muted} 
            fill={isLiked ? colors.live : "transparent"} 
          />
          <Text 
            style={{ color: isLiked ? colors.live : colors.muted }} 
            className="text-xs ml-2 font-black uppercase tracking-tighter"
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push(`/community/comments/${activity.id}`)}
          className="flex-row items-center"
        >
          <MessageSquare size={16} color={colors.muted} />
          <Text style={{ color: colors.muted }} className="text-xs ml-2 font-black uppercase tracking-tighter">
            {activity.commentsCount} avis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};