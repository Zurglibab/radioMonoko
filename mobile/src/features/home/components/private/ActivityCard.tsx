import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { Star, Heart, MessageSquare, MoreVertical } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * ActivityCard : Affiche une action de la communauté (critique, note).
 * Gère le feedback visuel immédiat pour les likes et s'adapte 
 * dynamiquement au Design System (Apple Light / OLED Dark).
 */
export const ActivityCard = ({ activity }: any) => {
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
        
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  // États locaux pour un feedback UI instantané
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(activity.likes);

  /**
   * handleLike : Inverse l'état du coup de cœur et ajuste le compteur.
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev: number) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <View 
      className="p-5 rounded-[16px] border mb-4"
      style={{ 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }}
    >
      {/* Utilisateur, Média et Évaluation */}
      <View className="flex-row items-start mb-4">
        {/* Initiales sur fond contrasté */}
        <View 
          style={{ backgroundColor: colors.background, borderColor: colors.border }}
          className="w-10 h-10 rounded-full items-center justify-center mr-3 border"
        >
          <Text style={{ color: colors.text }} className="font-black uppercase text-xs">
            {activity.user[0]}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text style={{ color: colors.muted }} className="text-[13px] leading-4">
                <Text style={{ color: colors.text }} className="font-bold">{activity.user}</Text>
                {" a noté "}
                <Text style={{ color: colors.text }} className="italic font-bold">
                  {activity.media || "Jazz Night"}
                </Text>
              </Text>
            </View>

            {/* Menu contextuel */}
            <TouchableOpacity 
              onPress={() => Alert.alert("Signalement", "Voulez-vous signaler cet avis ?")} 
              hitSlop={20}
            >
              <MoreVertical size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Système d'étoiles */}
          <View className="flex-row mt-1.5">
            {[1, 2, 3, 4, 5].map(i => (
              <Star 
                key={i} 
                size={12} 
                color={i <= activity.rating ? colors.warning : colors.border} 
                fill={i <= activity.rating ? colors.warning : "transparent"} 
                className="mr-0.5"
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Commentaire de l'utilisateur */}
      <Text 
        style={{ color: colors.text }} 
        className="text-[14px] mb-5 leading-5 opacity-90"
      >
        {activity.comment}
      </Text>

      {/* Interactions sociales */}
      <View 
        className="flex-row gap-x-6 pt-4 border-t" 
        style={{ borderColor: colors.border }}
      >
        {/* Bouton like */}
        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
          <Heart 
            size={16} 
            color={isLiked ? colors.danger : colors.muted} 
            fill={isLiked ? colors.danger : "transparent"} 
          />
          <Text 
            style={{ color: isLiked ? colors.danger : colors.muted }} 
            className="text-xs ml-2 font-black uppercase tracking-tighter"
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        {/* Bouton commentaires */}
        <TouchableOpacity className="flex-row items-center">
          <MessageSquare size={16} color={colors.muted} />
          <Text 
            style={{ color: colors.muted }} 
            className="text-xs ml-2 font-black uppercase tracking-tighter"
          >
            {activity.commentsCount} avis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};