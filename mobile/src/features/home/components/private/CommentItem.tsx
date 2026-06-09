import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Heart, MessageSquare, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ReviewComment } from "@/types/community";
import { AppColors } from "@/constants/theme";

interface Props {
  comment: ReviewComment;
  colors: AppColors;
  currentUserId: string;
  isInThread?: boolean;
  onLike: () => void;
  onReply: () => void;
  onDelete: () => void;
}

/**
 * CommentItem : Composant d'affichage d'un commentaire dans la section des commentaires d'une critique.
 * Affiche le commentaire avec l'avatar de l'auteur, son nom, le texte du commentaire, et les actions possibles (like, répondre, supprimer).
 * Gère également les liens vers les profils utilisateurs et les réponses ciblées.
 * @param param0 
 * @returns 
 */
export const CommentItem = ({ comment, colors, currentUserId, isInThread = false, onLike, onReply, onDelete }: Props) => {
  const router = useRouter();
  const isMine = comment.userId === currentUserId;

  return (
    <View>
      <View className="flex-row px-4 py-3">
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => router.push(`/community/user/${comment.userId}` as any)}
          className="mr-3 mt-0.5"
        >
          <Image
            source={{ uri: comment.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}&background=333&color=fff` }}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Name + timestamp */}
          <View className="flex-row items-center flex-wrap mb-1">
            <TouchableOpacity onPress={() => router.push(`/community/user/${comment.userId}` as any)}>
              <Text style={{ color: colors.text }} className="font-bold text-[15px] mr-2">{comment.username}</Text>
            </TouchableOpacity>
            {comment.replyTo && (
              <TouchableOpacity onPress={() => comment.replyToUserId && router.push(`/community/user/${comment.replyToUserId}` as any)}>
                <Text style={{ color: colors.primary }} className="text-xs font-semibold mr-2">@{comment.replyTo}</Text>
              </TouchableOpacity>
            )}
            <Text style={{ color: colors.muted }} className="text-xs">{comment.timestamp}</Text>
          </View>

          {/* Text */}
          <Text style={{ color: colors.text }} className="text-[15px] leading-[22px] mb-3">{comment.text}</Text>

          {/* Actions */}
          <View className="flex-row items-center gap-x-6">
            <TouchableOpacity className="flex-row items-center" onPress={onReply}>
              <MessageSquare size={16} color={colors.muted} />
              {!isInThread && (comment.repliesCount ?? 0) > 0 && (
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