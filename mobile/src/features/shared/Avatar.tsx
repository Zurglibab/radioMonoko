import React from "react";
import { View, Text, Image } from "react-native";

interface AvatarProps {
  name: string | null | undefined;
  avatar?: string;
  size?: number;
  colors: any;
}

export const Avatar = ({ name, avatar, size = 48, colors }: AvatarProps) => {
  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "900", fontSize: size * 0.35, textTransform: "uppercase" }}>
        {name?.[0] ?? "?"}
      </Text>
    </View>
  );
};
