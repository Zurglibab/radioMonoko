import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MessageSquare, Heart, Trash2 } from "lucide-react-native";
import { ReviewComment } from "@/types/community";
import { getAvatarFallbackUrl } from "@/utils/avatarFallback";

interface CommentRowProps {
  comment: ReviewComment;
  colors: any;
  currentUserId: string;
  onOpenThread: () => void;
  onLike: () => void;
  onReply: () => void;
  onDelete: () => void;
}

export const CommentRow = ({ comment, colors, currentUserId, onOpenThread, onLike, onReply, onDelete }: CommentRowProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const isMine = comment.userId === currentUserId;

  return (
    <View>
      <View className="flex-row px-4 py-3">
        <TouchableOpacity onPress={() => router.push(`/community/user/${comment.userId}` as any)} className="mr-3 mt-0.5">
          <Image
            source={{ uri: comment.avatar ?? getAvatarFallbackUrl(comment.username) }}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center flex-wrap mb-1">
            <TouchableOpacity onPress={() => router.push(`/community/user/${comment.userId}` as any)}>
              <Text style={{ color: colors.text }} className="font-bold text-[15px] mr-2">{comment.username}</Text>
            </TouchableOpacity>
            {comment.replyTo && (
              <Text style={{ color: colors.primary }} className="text-xs font-semibold mr-2">@{comment.replyTo}</Text>
            )}
            <Text style={{ color: colors.muted }} className="text-xs">{comment.timestamp}</Text>
          </View>

          <Text style={{ color: colors.text }} className="text-[15px] leading-[22px] mb-3">{comment.text}</Text>

          <View className="flex-row items-center gap-x-6">
            <TouchableOpacity className="flex-row items-center" onPress={onOpenThread}>
              <MessageSquare size={16} color={colors.muted} />
              {(comment.repliesCount ?? 0) > 0 && (
                <Text style={{ color: colors.muted }} className="text-xs ml-1.5">{comment.repliesCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center" onPress={onLike}>
              <Heart
                size={16}
                color={comment.hasLiked ? "#e11d48" : colors.muted}
                fill={comment.hasLiked ? "#e11d48" : "transparent"}
              />
              {comment.likes > 0 && (
                <Text style={{ color: comment.hasLiked ? "#e11d48" : colors.muted }} className="text-xs ml-1.5">{comment.likes}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onReply}>
              <Text style={{ color: colors.primary }} className="text-xs font-semibold">{t('community.comments.reply')}</Text>
            </TouchableOpacity>

            {isMine && (
              <TouchableOpacity onPress={onDelete}>
                <Trash2 size={14} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 60 }} />
    </View>
  );
};
