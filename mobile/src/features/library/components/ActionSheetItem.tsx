import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useThemeColors } from "@/utils/useThemeColors";

interface ActionSheetItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  textColor?: string;
  secondary?: string;
  disabled?: boolean;
  trailing?: React.ReactNode;
  highlighted?: boolean;
}

export const ActionSheetItem = ({
  icon,
  label,
  onPress,
  textColor,
  secondary = "",
  disabled = false,
  trailing = null,
  highlighted = false,
}: ActionSheetItemProps) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={{
        borderBottomColor: colors.border,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: highlighted ? colors.primary + '15' : 'transparent',
      }}
      className="flex-row items-center py-4 border-b px-2"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className="w-10 items-center">{icon}</View>
      <View className="flex-1 ml-3">
        <Text style={{ color: textColor || colors.text }} className="text-sm font-bold">{label}</Text>
        {secondary ? <Text style={{ color: colors.muted }} className="text-[10px] font-medium">{secondary}</Text> : null}
      </View>
      {trailing}
    </TouchableOpacity>
  );
};
