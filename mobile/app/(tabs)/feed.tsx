import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, useColorScheme, TextInput, Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageSquare, UserPlus, UserCheck, MoreVertical, Star, PenLine } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useCommunity } from "@/hooks/community/useCommunity";
import { SocialService } from "@/services/social/social.service";
import { LikeReviewService } from "@/services/reviews/likeReview.service";
import { NotificationService } from "@/services/notifications/notification.service";
import { SocialActivity } from "@/types/community";
import { useRouter } from "expo-router";

export default function FeedScreen() {
  const { appearanceSettings, token, user } = useAuthContext();
  const systemTheme = useColorScheme();
  const router = useRouter();

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const { feed, isLoading, refetch } = useCommunity();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        <Text style={{ color: colors.text }} className="text-[20px] font-black italic tracking-tighter">Le Flux</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search" as any)}
          style={{ backgroundColor: colors.primary }}
          className="flex-row items-center px-4 py-2 rounded-full"
        >
          <PenLine size={14} color={colors.background} />
          <Text style={{ color: colors.background }} className="text-xs font-black ml-2 uppercase tracking-wider">Publier</Text>
        </TouchableOpacity>
      </View>

      {/* Composer bar */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/search" as any)}
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderColor: colors.border }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username ?? 'Me')}&background=333&color=fff` }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1 rounded-full px-4 py-2.5 border" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text style={{ color: colors.muted }} className="text-[15px]">Critique une station...</Text>
        </View>
      </TouchableOpacity>

      {isLoading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {feed.length === 0 ? (
            <View className="py-24 items-center px-8">
              <Text style={{ color: colors.muted }} className="text-center text-[15px] leading-6">
                Aucune critique dans le flux pour l'instant.{"\n"}
                <Text style={{ color: colors.primary }}>Suis des utilisateurs</Text> pour voir leurs avis ici.
              </Text>
            </View>
          ) : (
            feed.map(activity => (
              <FeedCard
                key={activity.id}
                activity={activity}
                token={token}
                currentUserId={user?.id}
                currentUsername={user?.username}
                colors={colors}
                router={router}
              />
            ))
          )}
          <View className="h-16" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function FeedCard({ activity, token, currentUserId, currentUsername, colors, router }: {
  activity: SocialActivity;
  token: string | null;
  currentUserId?: string;
  currentUsername?: string;
  colors: any;
  router: any;
}) {
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

  const isOwnPost = activity.userId === currentUserId;

  const handleLike = async () => {
    if (!token || !currentUserId || isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    try {
      if (wasLiked) {
        await LikeReviewService.remove(token, activity.id, currentUserId);
      } else {
        await LikeReviewService.upsert(token, activity.id, currentUserId, true);
        if (activity.userId !== currentUserId) {
          NotificationService.create(token, {
            user_id: activity.userId,
            type: 'like',
            message: `${currentUsername ?? 'Quelqu\'un'} a aimé votre critique de ${activity.targetMedia}`,
            is_read: false,
          }).catch(() => {});
        }
      }
    } catch (err) {
      if (__DEV__) console.warn('[FeedCard] like failed:', err);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleFollow = async () => {
    if (!token) return;
    const was = isFollowing;
    setIsFollowing(!was);
    try {
      if (was) await SocialService.unfollowUser(token, activity.userId);
      else await SocialService.followUser(token, activity.userId);
    } catch { setIsFollowing(was); }
  };

  const handleMore = () => {
    Alert.alert("", activity.user, [
      { text: "Voir le profil", onPress: () => router.push(`/community/user/${activity.userId}`) },
      { text: "Signaler", style: "destructive", onPress: () => Alert.alert("Merci", "Contenu signalé aux administrateurs.") },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push(`/community/comments/${activity.id}` as any)}
        className="px-4 py-3 flex-row"
      >
        {/* Avatar column */}
        <TouchableOpacity
          onPress={() => router.push(`/community/user/${activity.userId}` as any)}
          className="mr-3 mt-0.5"
        >
          <Image
            source={{ uri: activity.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=333&color=fff` }}
            className="w-11 h-11 rounded-full"
          />
        </TouchableOpacity>

        {/* Content column */}
        <View className="flex-1">
          {/* Name + timestamp + follow + more */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-1 mr-2">
              <TouchableOpacity onPress={() => router.push(`/community/user/${activity.userId}` as any)}>
                <Text style={{ color: colors.text }} className="font-bold text-[15px] mr-2">{activity.user}</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.muted }} className="text-xs flex-shrink">{activity.timestamp}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              {!isOwnPost && (
                <TouchableOpacity
                  onPress={handleFollow}
                  className="px-3 py-1 rounded-full border"
                  style={{ borderColor: isFollowing ? colors.text : colors.border, backgroundColor: isFollowing ? colors.text : 'transparent' }}
                >
                  <Text style={{ color: isFollowing ? colors.background : colors.muted }} className="text-[11px] font-bold">
                    {isFollowing ? "Suivi" : "Suivre"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleMore} hitSlop={12}>
                <MoreVertical size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Media name + stars */}
          <Text style={{ color: colors.muted }} className="text-[13px] mb-1">
            Critique de{" "}
            <Text style={{ color: colors.text }} className="font-semibold italic">{activity.targetMedia}</Text>
          </Text>

          {activity.value !== undefined && (
            <View className="flex-row mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} color={i <= activity.value! ? "#f59e0b" : colors.border} fill={i <= activity.value! ? "#f59e0b" : "transparent"} />
              ))}
            </View>
          )}

          {/* Review text */}
          {activity.text && (
            <Text style={{ color: colors.text }} className="text-[15px] leading-[22px] mb-3">{activity.text}</Text>
          )}

          {/* Interactions */}
          <View className="flex-row items-center gap-x-6 mt-1">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push(`/community/comments/${activity.id}` as any)}
            >
              <MessageSquare size={16} color={colors.muted} />
              {activity.commentsCount > 0 && (
                <Text style={{ color: colors.muted }} className="text-xs ml-1.5">{activity.commentsCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center" onPress={handleLike} disabled={isLiking}>
              <Heart
                size={16}
                color={isLiked ? "#e11d48" : colors.muted}
                fill={isLiked ? "#e11d48" : "transparent"}
              />
              {likesCount > 0 && (
                <Text style={{ color: isLiked ? "#e11d48" : colors.muted }} className="text-xs ml-1.5">{likesCount}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: colors.border }} />
    </View>
  );
}