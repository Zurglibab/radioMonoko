import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuthContext } from "@/context/AuthContext";
import PublicHome from "@/features/home/screens/PublicHome";
import PrivateHome from "@/features/home/screens/PrivateHome";
import { useThemeColors } from "@/utils/useThemeColors";

export default function HomeScreen() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    return <PrivateHome user={user} />;
  }

  return <PublicHome />;
}
