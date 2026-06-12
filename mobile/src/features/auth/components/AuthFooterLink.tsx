import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { theme } from "@/constants/theme";

interface AuthFooterLinkProps {
  promptText: string;
  actionText: string;
  onPress: () => void;
}

export const AuthFooterLink = ({ promptText, actionText, onPress }: AuthFooterLinkProps) => (
  <View className="flex-row justify-center mt-12 mb-6">
    <Text style={{ color: theme.dark.colors.muted }}>{promptText}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={{ color: theme.dark.colors.text }} className="font-bold underline">
        {actionText}
      </Text>
    </TouchableOpacity>
  </View>
);
