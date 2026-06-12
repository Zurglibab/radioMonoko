import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react-native";

interface GuestAccessPromptProps {
  icon: LucideIcon;
  title: string;
  message: string;
  colors: any;
}

export const GuestAccessPrompt = ({ icon: Icon, title, message, colors }: GuestAccessPromptProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1 items-center justify-center px-8">
        <View
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="w-20 h-20 rounded-[28px] items-center justify-center border mb-6"
        >
          <Icon size={32} color={colors.primary} />
        </View>

        <Text style={{ color: colors.text }} className="text-xl font-black italic text-center mb-2 tracking-tight">
          {title}
        </Text>
        <Text style={{ color: colors.muted }} className="text-sm text-center leading-6 mb-8">
          {message}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/register")}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-4 rounded-2xl items-center mb-3"
        >
          <Text style={{ color: colors.background }} className="font-black uppercase text-xs tracking-widest">
            {t('common.guestAccess.register')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="py-2">
          <Text style={{ color: colors.muted }} className="font-bold text-xs uppercase tracking-widest">
            {t('common.guestAccess.login')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
