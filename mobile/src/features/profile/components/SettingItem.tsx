import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  secondary?: string;
  onPress?: () => void;
  isLast?: boolean;
  colors: any;
}

export const SettingItem = ({ icon: Icon, label, secondary, onPress, isLast = false, colors }: SettingItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{ borderBottomColor: colors.border }}
    className={`flex-row items-center py-4 ${!isLast ? "border-b" : ""}`}
  >
    <View style={{ backgroundColor: colors.background }} className="w-10 h-10 rounded-xl items-center justify-center">
      <Icon size={20} color={colors.text} />
    </View>
    <View className="flex-1 ml-4">
      <Text style={{ color: colors.text }} className="font-bold text-sm">{label}</Text>
      {secondary && (
        <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-bold tracking-tighter">{secondary}</Text>
      )}
    </View>
    <ChevronRight size={16} color={colors.muted} />
  </TouchableOpacity>
);
