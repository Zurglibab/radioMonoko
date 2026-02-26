import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Star, Heart, MessageSquare, MoreVertical } from "lucide-react-native";
import { theme } from "@/constants/theme";

/**
 * ActivityCard : Affiche une action de la communauté (critique, note).
 * Ce composant gère ses propres états d'interaction (Like) pour une 
 * expérience utilisateur instantanée et fluide.
 */
export const ActivityCard = ({ activity }: any) => {
  // États locaux pour gérer le feedback visuel immédiat avant synchronisation API
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(activity.likes);

  /**
   * Logique du bouton Like.
   * J'inverse l'état et on ajuste le compteur localement.
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev: number) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <View 
      className="p-4 rounded-3xl border mb-3"
      style={{ 
        backgroundColor: theme.dark.colors.surface, 
        borderColor: theme.dark.colors.border 
      }}
    >
      {/* Utilisateur et évaluation */}
      <View className="flex-row items-start mb-3">
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3 border border-white/5">
          <Text style={{ color: theme.dark.colors.text }} className="font-bold uppercase">
            {activity.user[0]}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            {/* Texte de l'activité avec mise en emphase du nom et du média */}
            <Text style={{ color: theme.dark.colors.muted }} className="text-sm">
              <Text style={{ color: theme.dark.colors.text }} className="font-bold">{activity.user}</Text>
              {" a noté "}
              <Text className="italic font-medium text-white">Jazz Night</Text>
            </Text>

            {/* Menu contextuel (Signalement/Options) */}
            <TouchableOpacity 
              onPress={() => Alert.alert("Signalement", "Voulez-vous signaler ce contenu ?")} 
              hitSlop={20} // Augmente la zone de clic pour le confort du pouce
            >
              <MoreVertical size={16} color={theme.dark.colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Système de notation par étoiles */}
          <View className="flex-row mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star 
                key={i} 
                size={12} 
                color={i <= activity.rating ? theme.dark.colors.warning : theme.dark.colors.border} 
                fill={i <= activity.rating ? theme.dark.colors.warning : "transparent"} 
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Le commentaire de l'utilisateur */}
      <Text 
        style={{ color: theme.dark.colors.muted }} 
        className="text-sm mb-4 leading-5"
      >
        {activity.comment}
      </Text>

      {/* Les interactions sociales (Likes & Commentaires) */}
      <View 
        className="flex-row gap-x-6 pt-3 border-t" 
        style={{ borderColor: theme.dark.colors.border }}
      >
        {/* Interaction Like */}
        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
          <Heart 
            size={16} 
            color={isLiked ? theme.dark.colors.danger : theme.dark.colors.muted} 
            fill={isLiked ? theme.dark.colors.danger : "transparent"} 
          />
          <Text 
            style={{ color: isLiked ? theme.dark.colors.danger : theme.dark.colors.muted }} 
            className="text-xs ml-2 font-bold"
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        {/* Lien vers les commentaires */}
        <TouchableOpacity className="flex-row items-center">
          <MessageSquare size={16} color={theme.dark.colors.muted} />
          <Text 
            style={{ color: theme.dark.colors.muted }} 
            className="text-xs ml-2"
          >
            {activity.commentsCount} avis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};