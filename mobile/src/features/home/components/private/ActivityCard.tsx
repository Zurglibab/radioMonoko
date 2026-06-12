import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Star, Heart, MessageSquare, MoreVertical, UserPlus, UserCheck } from "lucide-react-native";
import { SocialActivity } from "@/types/community";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/utils/useThemeColors";
import { useTranslation } from "react-i18next";
import { useActivityActions } from "@/features/community/hooks/useActivityActions";

export const ActivityCard = ({ activity }: { activity: SocialActivity }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const { isLiked, likesCount, isFollowing, isLiking, handleLike, handleFollow, handleReport } = useActivityActions(activity);

  return (
    <View
      className="p-5 rounded-[24px] border mb-4 shadow-sm"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      {activity.featured && (
        <View
          style={{ backgroundColor: colors.primary + "22", borderColor: colors.primary }}
          className="self-start flex-row items-center px-2.5 py-1 rounded-full border mb-3"
        >
          <Star size={10} color={colors.primary} fill={colors.primary} />
          <Text style={{ color: colors.primary }} className="text-[9px] font-black uppercase tracking-widest ml-1.5">
            {t('home.activityCard.featuredBadge')}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
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

      <View className="mb-4">
        <Text style={{ color: colors.muted }} className="text-[13px] leading-4 mb-2">
           {activity.type === 'REVIEW' ? t('home.activityCard.publishedReviewOn') : t('home.activityCard.rated')}
           <Text style={{ color: colors.text }} className="font-bold italic">
             {activity.targetMedia}
           </Text>
        </Text>

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

        {activity.text && (
          <Text 
            style={{ color: colors.text }} 
            className="text-[14px] leading-5 opacity-90 italic"
          >
            &ldquo;{activity.text}&rdquo;
          </Text>
        )}
      </View>
      
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
            {t('home.activityCard.reviewsCount', { count: activity.commentsCount })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};