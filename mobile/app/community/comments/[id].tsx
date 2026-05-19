import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Send, X } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useComments } from "@/hooks/community/useComments";
import { CommentItem } from "@/features/home/components/private/CommentItem";

/**
 * CommentsScreen : Contrôleur d'affichage et de saisie des fils de discussion.
 * Gère de manière unifiée deux modes d'affichage :
 * Mode Racine : Liste chronologique des commentaires généraux liés à une critique.
 * Mode Thread : Focus sur un commentaire parent spécifique et liste de ses réponses directes.
 */
export default function CommentsScreen() {
  // id : ID de la critique ou de l'œuvre / targetCommentId : ID du commentaire ciblé si vue fil imbriqué
  const { id, targetCommentId } = useLocalSearchParams<{ id: string; targetCommentId?: string }>();
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  const inputRef = useRef<TextInput>(null); // Référence pour piloter l'ouverture forcée du clavier

  const isDark =
    appearanceSettings.themeMode === "system"
      ? systemTheme === "dark"
      : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const {
    comments,
    focusedComment,
    replyingTo,
    setReplyingTo,
    isLoading,
    sendComment,
    toggleLikeComment,
    deleteMyComment,
    currentUserId,
  } = useComments(id, targetCommentId);

  const [newComment, setNewComment] = useState("");
  const isThreadView = !!targetCommentId;

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  /**
   * handleSend : Orchestre l'expédition du message
   * Valide les données locales puis délègue au hook la création de la réponse structurée.
   */
  const handleSend = () => {
    if (!newComment.trim()) return;
    sendComment(newComment);
    setNewComment(""); // Nettoyage de la boite de saisie
  };

  return (
    <SafeAreaView 
      className="flex-1" 
      style={{ backgroundColor: colors.background }} 
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border active:opacity-60"
        >
          <ChevronLeft color={colors.text} size={20} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-lg font-black italic ml-4">
          {isThreadView ? "Fil de discussion" : "Discussion"}
        </Text>
      </View>

      {isLoading ? (
        /* Loader pendant la latence réseau simulée */
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Rendu du message parent mis en valeur */}
          {isThreadView && focusedComment && (
            <>
              <CommentItem
                comment={focusedComment}
                colors={colors}
                currentUserId={currentUserId}
                isInThread
                onLike={() => toggleLikeComment(focusedComment.id)}
                onReply={() => setReplyingTo(focusedComment)}
                onDelete={() => deleteMyComment(focusedComment.id)}
              />
              {/* Connecteur visuel de fil d'actualité pour matérialiser l'arbre de discussion */}
              <View className="flex-row items-center mb-3 ml-2">
                <View style={{ backgroundColor: colors.border }} className="w-[2px] h-5 ml-[17px] mr-3" />
                <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
                  Réponses
                </Text>
              </View>
            </>
          )}

          {/* Rendu séquentiel des commentaires / réponses */}
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              colors={colors}
              currentUserId={currentUserId}
              isInThread={isThreadView}
              onLike={() => toggleLikeComment(c.id)}
              onReply={() => {
                if (isThreadView) {
                  // On est déjà au fond du thread, alors on ajoute une mention @pseudo dans la zone de saisie actuelle
                  setReplyingTo(c);
                } else {
                  // On est à la racine, alors on s'enfonce dans le sous-thread dédié à ce commentaire
                  router.push({
                    pathname: `/community/comments/${id}`,
                    params: { targetCommentId: c.id },
                  } as any);
                }
              }}
              onDelete={() => deleteMyComment(c.id)}
            />
          ))}

          {/* Gestion de la liste vide */}
          {comments.length === 0 && (
            <View className="items-center py-16">
              <Text style={{ color: colors.muted }} className="text-sm font-bold text-center">
                {isThreadView ? "Aucune réponse pour l'instant." : "Soyez le premier à commenter."}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Zone d'écriture avec ancrage clavier intelligent */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        
        {/* Indique visuellement à qui s'adresse la réponse */}
        {replyingTo && (
          <View
            className="px-5 pt-2 pb-1 flex-row items-center"
            style={{ backgroundColor: colors.background }}
          >
            <Text style={{ color: colors.muted }} className="text-xs font-bold flex-1">
              Réponse à{" "}
              <Text style={{ color: colors.primary }}>@{replyingTo.username}</Text>
            </Text>
            {/* Annule le ciblage de la réponse et repasse en mode global */}
            <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={12}>
              <X size={14} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Conteneur du TextInput et bouton Send */}
        <View
          className="p-4 border-t flex-row items-center mb-2"
          style={{ borderTopColor: colors.border, backgroundColor: colors.background }}
        >
          <TextInput
            ref={inputRef}
            value={newComment}
            onChangeText={setNewComment}
            placeholder={
              replyingTo
                ? `Répondre à @${replyingTo.username}...`
                : isThreadView
                ? "Ajouter une réponse..."
                : "Commenter..."
            }
            placeholderTextColor={colors.muted}
            className="flex-1 h-12 px-5 rounded-full border font-medium text-sm"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            className="ml-3 p-3 rounded-full active:scale-95"
            style={{ backgroundColor: colors.primary }}
          >
            <Send size={16} color={colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}