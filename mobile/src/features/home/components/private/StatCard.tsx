import React from "react";
import { View, Text } from "react-native";
import { useThemeColors } from "@/utils/useThemeColors";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const StatCard = ({ label, value, icon }: StatCardProps) => {
  const colors = useThemeColors();

  return (
    <View
      className="flex-1 p-5 rounded-[16px] border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      <View 
        style={{ backgroundColor: colors.background }}
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
      >
        {icon}
      </View>

      <Text
        style={{ color: colors.muted }}
        className="text-[9px] uppercase font-black tracking-[2px] mb-1"
      >
        {label}
      </Text>

      <Text
        style={{ color: colors.text }}
        className="text-2xl font-black tracking-tighter"
      >
        {value}
      </Text>
    </View>
  );
};