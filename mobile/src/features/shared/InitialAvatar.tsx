import React from "react";
import { View, Text } from "react-native";

interface InitialAvatarProps {
  name: string;
  size?: number;
  colors: any;
}

export const InitialAvatar = ({ name, size = 80, colors }: InitialAvatarProps) => {
  const initials = name
    .split(/[\s_.-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.35,
        backgroundColor: colors.primary + "22",
        borderColor: colors.border,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.primary, fontSize: size * 0.38, fontWeight: "900" }}>
        {initials || "?"}
      </Text>
    </View>
  );
};
