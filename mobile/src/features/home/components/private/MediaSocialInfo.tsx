import React from 'react';
import { View, Text, Image } from 'react-native';
import { User } from '@/types/auth';
import { getAvatarFallbackUrl } from '@/utils/avatarFallback';
import { useTranslation } from "react-i18next";

interface MediaSocialInfoProps {
  friends: User[];
  colors: any;
}

export const MediaSocialInfo = ({ friends, colors }: MediaSocialInfoProps) => {
  const { t } = useTranslation();

  if (!friends || friends.length === 0) return null;

  return (
    <View className="flex-row items-center mt-6 px-1">
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
              source={{ uri: friend.avatar || getAvatarFallbackUrl(friend.username) }}
              className="w-full h-full"
            />
          </View>
        ))}
      </View>

      <Text style={{ color: colors.muted }} className="text-[11px] font-medium ml-3 flex-1">
        <Text style={{ color: colors.text }} className="font-bold">
          {friends[0].username}
        </Text>
        {friends.length > 1
          ? t('home.mediaSocialInfo.listeningWithOthers', { count: friends.length - 1 })
          : t('home.mediaSocialInfo.listeningAlone')}
      </Text>
    </View>
  );
};