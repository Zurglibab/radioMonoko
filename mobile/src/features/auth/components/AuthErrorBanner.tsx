import React from "react";
import { Text, View } from "react-native";

interface AuthErrorBannerProps {
  message: string;
}

export const AuthErrorBanner = ({ message }: AuthErrorBannerProps) => (
  <View className="bg-red-500/10 border border-red-500 p-4 rounded-xl mb-6">
    <Text className="text-red-500 text-center font-bold text-sm">{message}</Text>
  </View>
);
