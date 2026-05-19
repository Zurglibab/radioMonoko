import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Heart, MessageSquare, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { ReviewComment } from "@/types/community";
import { AppColors } from "@/constants/theme";

interface Props {
  comment: ReviewComment;     // L'objet data du commentaire typé
  colors: AppColors;          // Les couleurs issues du thème dynamique actuel
  currentUserId: string;      // ID de l'utilisateur connecté
  isInThread?: boolean;       // Flag pour savoir si on est déjà dans une sous-discussion
  onLike: () => void;         // Callback transmis par useComments
  onReply: () => void;        // Callback pour déclencher l'état de réponse
  onDelete: () => void;       // Callback pour la modération locale
}

/**
 * CommentItem : Composant d'affichage d'un commentaire unique.
 * Gère l'imbrication visuelle (retrait si enfant), le ciblage des réponses, les interactions sociales (like/réponse) et la modération (suppression).
 * 
 * RÈGLES MÉTIERS :
 * - Seuls les commentaires de premier niveau sont affichés dans le flux principal. Les réponses sont accessibles via le bouton "Répondre".
 * - La poubelle de suppression n'apparaît que pour les commentaires appartenant à l'utilisateur connecté.
 * - Le badge de mention "@Utilisateur" est affiché pour les réponses ciblées, avec un lien vers le profil de la personne mentionnée.
 */
export const CommentItem = ({ 
  comment, 
  colors, 
  currentUserId, 
  isInThread = false, 
  onLike, 
  onReply, 
  onDelete 
}: Props) => {
  const router = useRouter();
  
  // On vérifie si le commentaire appartient à l'utilisateur connecté
  const isMine = comment.userId === currentUserId;

  /**
   * goToProfile : Redirige vers le profil public d'un membre de la communauté.
   */
  const goToProfile = (userId: string) => router.push(`/community/user/${userId}` as any);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        // Si c'est un sous-commentaire, on applique un retrait de 24px
        // pour créer la hiérarchie visuelle de discussion (sauf si on est déjà dans le thread isolé)
        marginLeft: comment.parentId && !isInThread ? 24 : 0,
      }}
      className="mb-3 p-4 rounded-[20px] border flex-row items-start"
    >
      {/* Avatar de l'utilisateur */}
      <TouchableOpacity
        onPress={() => goToProfile(comment.userId)}
        activeOpacity={0.7}
        className="w-9 h-9 rounded-full mr-3 bg-zinc-800 border overflow-hidden"
        style={{ borderColor: colors.border }}
      >
        <Image
          source={{ uri: comment.avatar ?? `https://ui-avatars.com/api/?name=${comment.username}&background=333&color=fff` }}
          className="w-full h-full"
        />
      </TouchableOpacity>

      {/* Bloc de contenu principal */}
      <View className="flex-1">
        {/* Métadonnées et Actions de modération */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-wrap">
            {/* Pseudo de l'auteur */}
            <TouchableOpacity onPress={() => goToProfile(comment.userId)}>
              <Text style={{ color: colors.text }} className="font-bold text-sm mr-2">
                {comment.username}
              </Text>
            </TouchableOpacity>
            
            {/* Badge de mention : Affiché uniquement si c'est une réponse ciblée à quelqu'un */}
            {comment.replyTo && (
              <TouchableOpacity
                onPress={() => comment.replyToUserId && goToProfile(comment.replyToUserId)}
                disabled={!comment.replyToUserId}
              >
                <Text style={{ color: colors.primary }} className="text-xs font-bold mr-2">
                  @{comment.replyTo}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Timestamp */}
            <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-bold tracking-tighter">
              {comment.timestamp}
            </Text>
          </View>

          {/* La poubelle n'apparaît que si l'utilisateur est l'auteur */}
          {isMine && (
            <TouchableOpacity onPress={onDelete} hitSlop={15}>
              <Trash2 size={14} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Le texte du commentaire */}
        <Text style={{ color: colors.text }} className="text-sm leading-5 mb-3">
          {comment.text}
        </Text>

        {/* Interactions Sociales */}
        <View className="flex-row items-center gap-x-5">
          {/* Liker le commentaire */}
          <TouchableOpacity onPress={onLike} className="flex-row items-center">
            <Heart
              size={13}
              color={comment.hasLiked ? colors.live : colors.muted}
              fill={comment.hasLiked ? colors.live : "transparent"}
            />
            <Text 
              style={{ color: comment.hasLiked ? colors.live : colors.muted }} 
              className="text-[11px] font-black ml-1.5"
            >
              {comment.likes}
            </Text>
          </TouchableOpacity>

          {/* Répondre ou compteur de réponses */}
          <TouchableOpacity onPress={onReply} className="flex-row items-center">
            <MessageSquare size={13} color={colors.muted} />
            {!isInThread && (comment.repliesCount ?? 0) > 0 ? (
              <Text style={{ color: colors.muted }} className="text-[11px] font-black ml-1.5">
                {comment.repliesCount}
              </Text>
            ) : (
              <Text style={{ color: colors.muted }} className="text-[11px] font-black ml-1.5 uppercase">
                Répondre
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};