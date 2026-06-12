import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface ProfileHeaderProps {
  title: string;
  colors: any;
}

export const ProfileHeader = ({ title, colors }: ProfileHeaderProps) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-6 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        className="p-2 rounded-full mr-4 border active:opacity-60"
      >
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
        {title}
      </Text>
    </View>
  );
};
