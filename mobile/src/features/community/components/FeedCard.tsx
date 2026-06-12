import React from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Heart, MessageSquare, MoreVertical, Star } from "lucide-react-native";
import { useThemeColors } from "@/utils/useThemeColors";
import { getAvatarFallbackUrl } from "@/utils/avatarFallback";
import { SocialActivity } from "@/types/community";
import { useActivityActions } from "@/features/community/hooks/useActivityActions";

export const FeedCard = ({ activity }: { activity: SocialActivity }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { isLiked, likesCount, isFollowing, isLiking, isOwnPost, handleLike, handleFollow, handleReport } = useActivityActions(activity);

  const handleMore = () => {
    Alert.alert("", activity.user, [
      { text: t('community.feed.viewProfile'), onPress: () => router.push(`/community/user/${activity.userId}`) },
      { text: t('common.report'), style: "destructive", onPress: handleReport },
      { text: t('common.cancel'), style: "cancel" },
    ]);
  };

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push(`/community/comments/${activity.id}` as any)}
        className="px-4 py-3 flex-row"
      >
        <TouchableOpacity
          onPress={() => router.push(`/community/user/${activity.userId}` as any)}
          className="mr-3 mt-0.5"
        >
          <Image
            source={{ uri: activity.avatar ?? getAvatarFallbackUrl(activity.user) }}
            className="w-11 h-11 rounded-full"
          />
        </TouchableOpacity>

        <View className="flex-1">
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
                    {isFollowing ? t('community.feed.following') : t('common.follow')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleMore} hitSlop={12}>
                <MoreVertical size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {activity.featured && (
            <View
              style={{ backgroundColor: colors.primary + "22", borderColor: colors.primary }}
              className="self-start flex-row items-center px-2.5 py-1 rounded-full border mb-2"
            >
              <Star size={10} color={colors.primary} fill={colors.primary} />
              <Text style={{ color: colors.primary }} className="text-[9px] font-black uppercase tracking-widest ml-1.5">
                {t('home.activityCard.featuredBadge')}
              </Text>
            </View>
          )}

          <Text style={{ color: colors.muted }} className="text-[13px] mb-1">
            {t('community.feed.reviewOf')}{" "}
            <Text style={{ color: colors.text }} className="font-semibold italic">{activity.targetMedia}</Text>
          </Text>

          {activity.value !== undefined && (
            <View className="flex-row mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} color={i <= activity.value! ? "#f59e0b" : colors.border} fill={i <= activity.value! ? "#f59e0b" : "transparent"} />
              ))}
            </View>
          )}

          {activity.text && (
            <Text style={{ color: colors.text }} className="text-[15px] leading-[22px] mb-3">{activity.text}</Text>
          )}

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
};
