import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, UserCircle } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { WELCOME_IMAGE } from "@/features/onboarding/data/slides";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuthContext();

  const handleGuestAccess = async () => {
    try {
      await logout();
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Erreur lors de l'accès invité", error);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <Image
        source={WELCOME_IMAGE}
        className="absolute w-full h-full opacity-60"
        resizeMode="cover"
        fadeDuration={0}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'black']}
        locations={[0, 0.4, 0.8]}
        className="absolute w-full h-full"
      />

      <View className="flex-1 justify-end px-8 pb-16">
        <View className="mb-12">
          <View className="flex-row items-center mb-6">
            <Text className="text-white font-bold text-sm tracking-[4px] uppercase opacity-70">
              RadioMonoco
            </Text>
          </View>

          <Text className="text-white font-bold text-6xl mb-4 tracking-tighter leading-[55px]">
            {t('auth.welcome.titleLine1')}{"\n"}<Text className="text-white/50">{t('auth.welcome.titleLine2')}</Text>
          </Text>

          <Text className="text-gray-400 text-lg font-light leading-7">
            {t('auth.welcome.description')}
          </Text>
        </View>

        <View className="gap-y-4">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
            className="bg-white w-full py-5 rounded-2xl items-center flex-row justify-center shadow-xl"
          >
            <Text className="text-black font-bold text-lg">{t('auth.welcome.loginButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.7}
            className="w-full py-5 rounded-2xl items-center border border-white/30 flex-row justify-center"
          >
            <Text className="text-white font-bold text-lg mr-2">{t('auth.welcome.registerButton')}</Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGuestAccess}
            activeOpacity={0.6}
            className="mt-2 py-2 items-center flex-row justify-center"
          >
            <UserCircle size={16} color="#9CA3AF" />
            <Text className="text-gray-400 font-medium text-sm ml-2 underline">
              {t('auth.welcome.guestButton')}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-gray-600 text-[10px] tracking-widest uppercase font-bold">
            {t('auth.welcome.poweredBy')}
          </Text>
        </View>
      </View>
    </View>
  );
}