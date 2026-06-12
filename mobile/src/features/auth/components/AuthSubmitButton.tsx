import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { theme } from "@/constants/theme";

interface AuthSubmitButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AuthSubmitButton = ({ label, onPress, isLoading = false, disabled = false, className = "" }: AuthSubmitButtonProps) => {
  const isBlocked = isLoading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isBlocked}
      className={`h-16 rounded-2xl items-center justify-center shadow-lg ${className}`}
      style={{
        backgroundColor: isBlocked ? theme.dark.colors.surface : theme.dark.colors.primary,
        opacity: isLoading ? 0.7 : disabled ? 0.5 : 1,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.dark.colors.secondary} />
      ) : (
        <Text
          style={{ color: isBlocked ? theme.dark.colors.muted : theme.dark.colors.secondary }}
          className="font-bold text-lg uppercase tracking-widest"
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
