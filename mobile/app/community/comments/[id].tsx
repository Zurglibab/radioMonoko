import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Send, X, MessageSquare } from "lucide-react-native";
import { useAuthContext } from "@/context/AuthContext";
import { useComments } from "@/hooks/community/useComments";
import { ReviewService } from "@/services/reviews/review.service";
import { ReviewDTO } from "@/types/review";
import { UserService } from "@/services/users/user.service";
import { useThemeColors } from "@/utils/useThemeColors";
import { getAvatarFallbackUrl } from "@/utils/avatarFallback";
import { CommentRow } from "@/features/community/components/CommentRow";

export default function CommentsScreen() {
  const { t } = useTranslation();
  const { id, targetCommentId } = useLocalSearchParams<{ id: string; targetCommentId?: string }>();
  const router = useRouter();
  const { token, user } = useAuthContext();
  const colors = useThemeColors();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const insets = useSafeAreaInsets();

  const [parentReview, setParentReview] = useState<ReviewDTO | null>(null);
  const [parentAuthor, setParentAuthor] = useState<string>("...");
  const [parentAvatar, setParentAvatar] = useState<string | undefined>();
  const [parentContentId, setParentContentId] = useState<string | null>(null);

  const { comments, focusedComment, replyingTo, setReplyingTo, isLoading, sendComment, toggleLikeComment, deleteMyComment, currentUserId } = useComments(id, targetCommentId, parentContentId, parentReview?.user_id ?? null);
  const [newComment, setNewComment] = useState("");
  const isThreadView = !!targetCommentId;

  useFocusEffect(useCallback(() => {
    if (!token || !id) return;
    ReviewService.getById(token, id)
      .then(async (review) => {
        setParentReview(review);
        setParentContentId(review.content_id);
        try {
          const profile = await UserService.getById(token, review.user_id);
          setParentAuthor(profile.display_name ?? profile.username);
          setParentAvatar(profile.avatar);
        } catch {}
      })
      .catch(() => {});
  }, [token, id]));

  useEffect(() => { if (replyingTo) inputRef.current?.focus(); }, [replyingTo]);

  const handleSend = () => {
    if (!newComment.trim()) return;
    sendComment(newComment);
    setNewComment("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{ paddingTop: insets.top, borderBottomWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} hitSlop={16} className="mr-4">
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-[17px] font-bold">
            {isThreadView ? t('community.comments.headerThread') : t('community.comments.headerPost')}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {!isThreadView && parentReview && (
          <View className="px-4 pt-4 pb-3">
            <View className="flex-row mb-3">
              <Image
                source={{ uri: parentAvatar ?? getAvatarFallbackUrl(parentAuthor) }}
                className="w-11 h-11 rounded-full mr-3"
              />
              <View className="flex-1 justify-center">
                <Text style={{ color: colors.text }} className="font-bold text-[15px]">{parentAuthor}</Text>
                <Text style={{ color: colors.muted }} className="text-xs">
                  {new Date(parentReview.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <Text style={{ color: colors.text }} className="text-[17px] leading-[26px] mb-4">{parentReview.comment}</Text>

            <View className="flex-row items-center gap-x-5 py-3 border-t border-b" style={{ borderColor: colors.border }}>
              <View className="flex-row items-center">
                <MessageSquare size={16} color={colors.muted} />
                <Text style={{ color: colors.muted }} className="text-sm ml-1.5">{t('community.comments.replies', { count: comments.length })}</Text>
              </View>
            </View>
          </View>
        )}

        {isThreadView && focusedComment && (
          <>
            <CommentRow
              comment={focusedComment}
              colors={colors}
              currentUserId={currentUserId}
              onOpenThread={() => router.push({ pathname: `/community/comments/${id}`, params: { targetCommentId: focusedComment.id } } as any)}
              onLike={() => toggleLikeComment(focusedComment.id)}
              onReply={() => setReplyingTo(focusedComment)}
              onDelete={() => deleteMyComment(focusedComment.id)}
            />
            <View className="px-4 py-2">
              <View style={{ backgroundColor: colors.border }} className="w-[2px] h-4 ml-5" />
              <Text style={{ color: colors.muted }} className="text-xs font-bold uppercase tracking-widest ml-5 mt-1">{t('community.comments.repliesSectionTitle')}</Text>
            </View>
          </>
        )}

        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View className="py-16 items-center px-8">
            <Text style={{ color: colors.muted }} className="text-center text-[15px]">
              {isThreadView ? t('community.comments.emptyThread') : t('community.comments.emptyComments')}
            </Text>
          </View>
        ) : (
          comments.map(c => (
            <CommentRow
              key={c.id}
              comment={c}
              colors={colors}
              currentUserId={currentUserId}
              onOpenThread={() => router.push({ pathname: `/community/comments/${id}`, params: { targetCommentId: c.id } } as any)}
              onLike={() => toggleLikeComment(c.id)}
              onReply={() => setReplyingTo(c)}
              onDelete={() => deleteMyComment(c.id)}
            />
          ))
        )}

        <View className="h-4" />
      </ScrollView>

      <View style={{ backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border }}>
        {replyingTo && (
          <View
            className="flex-row items-center px-4 py-2"
            style={{ borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
          >
            <Text style={{ color: colors.muted }} className="flex-1 text-xs">
              {t('community.comments.replyingTo')}{" "}
              <Text style={{ color: colors.primary }} className="font-semibold">@{replyingTo.username}</Text>
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={12}>
              <X size={14} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}
          className="flex-row items-end px-3 pt-2 gap-x-2"
        >
          <Image
            source={{ uri: user?.avatar ?? getAvatarFallbackUrl(user?.username ?? 'Me') }}
            className="w-8 h-8 rounded-full mb-1"
          />
          <View
            className="flex-1 rounded-2xl border px-4 py-2.5"
            style={{ borderColor: colors.border, backgroundColor: colors.surface, minHeight: 42, maxHeight: 120 }}
          >
            <TextInput
              ref={inputRef}
              value={newComment}
              onChangeText={setNewComment}
              placeholder={replyingTo ? t('community.comments.replyPlaceholder', { username: replyingTo.username }) : t('community.comments.commentPlaceholder')}
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, fontSize: 15 }}
              multiline
              returnKeyType="default"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!newComment.trim()}
            style={{ backgroundColor: newComment.trim() ? colors.primary : colors.border }}
            className="w-9 h-9 rounded-full items-center justify-center mb-1"
          >
            <Send size={16} color={newComment.trim() ? colors.background : colors.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}