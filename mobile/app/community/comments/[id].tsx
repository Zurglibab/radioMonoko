import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Send, X, Heart, MessageSquare, Trash2 } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useComments } from "@/hooks/community/useComments";
import { ReviewService } from "@/services/reviews/review.service";
import { ReviewDTO } from "@/types/review";
import { UserService } from "@/services/users/user.service";
import { ReviewComment } from "@/types/community";

/**
 * CommentsScreen : Écran de gestion des commentaires d'une critique.
 * Affiche la critique originale, le parent et la liste des commentaires associés.
 * Permet de répondre à un commentaire spécifique, de liker, et de supprimer ses propres commentaires.
 * Gère également l'affichage d'un thread de réponses ciblé lorsqu'on accède à un commentaire précis.
 * @returns 
 */
export default function CommentsScreen() {
  const { t } = useTranslation();
  const { id, targetCommentId } = useLocalSearchParams<{ id: string; targetCommentId?: string }>();
  const router = useRouter();
  const { appearanceSettings, token, user } = useAuthContext();
  const systemTheme = useColorScheme();
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const isDark = appearanceSettings.themeMode === "system" ? systemTheme === "dark" : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

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
        } catch { /* ignore */ }
      })
      .catch(() => { /* not blocking */ });
  }, [token, id]));

  useEffect(() => { if (replyingTo) inputRef.current?.focus(); }, [replyingTo]);

  const handleSend = () => {
    if (!newComment.trim()) return;
    sendComment(newComment);
    setNewComment("");
  };

  const CommentRow = ({ comment, isParent = false }: { comment: ReviewComment; isParent?: boolean }) => {
    const isMine = comment.userId === currentUserId;
    return (
      <View>
        <View className="flex-row px-4 py-3">
          {/* Avatar */}
          <TouchableOpacity onPress={() => router.push(`/community/user/${comment.userId}` as any)} className="mr-3 mt-0.5">
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
                <Text style={{ color: colors.primary }} className="text-xs font-semibold mr-2">@{comment.replyTo}</Text>
              )}
              <Text style={{ color: colors.muted }} className="text-xs">{comment.timestamp}</Text>
            </View>

            {/* Text */}
            <Text style={{ color: colors.text }} className="text-[15px] leading-[22px] mb-3">{comment.text}</Text>

            {/* Actions */}
            <View className="flex-row items-center gap-x-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push({ pathname: `/community/comments/${id}`, params: { targetCommentId: comment.id } } as any)}
              >
                <MessageSquare size={16} color={colors.muted} />
                {(comment.repliesCount ?? 0) > 0 && (
                  <Text style={{ color: colors.muted }} className="text-xs ml-1.5">{comment.repliesCount}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center" onPress={() => toggleLikeComment(comment.id)}>
                <Heart
                  size={16}
                  color={comment.hasLiked ? "#e11d48" : colors.muted}
                  fill={comment.hasLiked ? "#e11d48" : "transparent"}
                />
                {comment.likes > 0 && (
                  <Text style={{ color: comment.hasLiked ? "#e11d48" : colors.muted }} className="text-xs ml-1.5">{comment.likes}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setReplyingTo(comment)}>
                <Text style={{ color: colors.primary }} className="text-xs font-semibold">{t('community.comments.reply')}</Text>
              </TouchableOpacity>

              {isMine && (
                <TouchableOpacity onPress={() => deleteMyComment(comment.id)}>
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
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

      {/* Contenu scrollable */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Commentaire parent */}
        {!isThreadView && parentReview && (
          <View className="px-4 pt-4 pb-3">
            <View className="flex-row mb-3">
              <Image
                source={{ uri: parentAvatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(parentAuthor)}&background=333&color=fff` }}
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

        {/* Thread parent */}
        {isThreadView && focusedComment && (
          <>
            <CommentRow comment={focusedComment} isParent />
            <View className="px-4 py-2">
              <View style={{ backgroundColor: colors.border }} className="w-[2px] h-4 ml-5" />
              <Text style={{ color: colors.muted }} className="text-xs font-bold uppercase tracking-widest ml-5 mt-1">{t('community.comments.repliesSectionTitle')}</Text>
            </View>
          </>
        )}

        {/* Comments list */}
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
          comments.map(c => <CommentRow key={c.id} comment={c} />)
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Zone fixe en bas */}
      <View style={{ backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.border }}>
        {/* Reply indicator */}
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

        {/* Input bar + safe area bottom */}
        <View
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }}
          className="flex-row items-end px-3 pt-2 gap-x-2"
        >
          <Image
            source={{ uri: user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username ?? 'Me')}&background=333&color=fff` }}
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