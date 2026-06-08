import React from "react";
import { View, Text } from "react-native";

interface InitialAvatarProps {
  username: string;
  size?: number;
  colors: any;
}

/**
 * Affiche un avatar circulaire avec les initiales de l'utilisateur, 
 * utilisé comme fallback lorsque l'image de profil n'est pas disponible.
 * @param param0 
 * @returns 
 */
export const InitialAvatar = ({ username, size = 80, colors }: InitialAvatarProps) => {
  const initials = username
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
