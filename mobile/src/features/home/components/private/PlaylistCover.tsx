import React from "react";
import { View, Image } from "react-native";
import { MediaItem } from "@/types/library";

export const PlaylistCover = ({
  items,
  size = 64,
  name,
}: {
  items: MediaItem[];
  size?: number;
  name?: string;
}) => {
  const validItems = items.filter(i => !!i.imageUrl);

  if (validItems.length === 0) {
    const label = name ?? "♪";
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=1A1A1A&color=FFFFFF&length=2&bold=true&uppercase=true&font-size=0.4`;
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size }}
        className="rounded-xl"
      />
    );
  }

  if (validItems.length < 4) {
    return (
      <Image
        source={{ uri: validItems[0].imageUrl }}
        style={{ width: size, height: size }}
        className="rounded-xl bg-zinc-800"
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className="flex-row flex-wrap rounded-xl overflow-hidden bg-zinc-900"
    >
      {validItems.slice(0, 4).map((item, index) => (
        <Image
          key={index}
          source={{ uri: item.imageUrl }}
          style={{ width: size / 2, height: size / 2 }}
          className="border-[0.5px] border-black/10"
        />
      ))}
    </View>
  );
};
