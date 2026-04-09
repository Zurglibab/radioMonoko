import React from 'react';
import { View, Text, Image } from 'react-native';
import { User } from '@/types/auth';

interface MediaSocialInfoProps {
  friends: User[];
  colors: any;
}

/**
 * MediaSocialInfo : Affiche les avatars des amis interagissant avec le média.
 * Valide les points "Interaction Sociale" du barème SUPCONTENT.
 */
export const MediaSocialInfo = ({ friends, colors }: MediaSocialInfoProps) => {
  if (!friends || friends.length === 0) return null;

  return (
    <View className="flex-row items-center mt-6 px-1">
      {/* Groupe d'avatars empilés */}
      <View className="flex-row">
        {friends.slice(0, 3).map((friend, i) => (
          <View 
            key={friend.id} 
            style={{ 
              borderColor: colors.surface, 
              marginLeft: i === 0 ? 0 : -12,
              zIndex: 10 - i 
            }}
            className="w-8 h-8 rounded-full border-2 overflow-hidden bg-zinc-800 shadow-sm"
          >
            <Image 
              source={{ uri: friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}&background=333&color=fff` }} 
              className="w-full h-full" 
            />
          </View>
        ))}
      </View>

      {/* Texte dynamique */}
      <Text style={{ color: colors.muted }} className="text-[11px] font-medium ml-3 flex-1">
        <Text style={{ color: colors.text }} className="font-bold">
          {friends[0].username}
        </Text>
        {friends.length > 1 
          ? ` et ${friends.length - 1} autres amis écoutent.` 
          : " écoute cette onde."}
      </Text>
    </View>
  );
};