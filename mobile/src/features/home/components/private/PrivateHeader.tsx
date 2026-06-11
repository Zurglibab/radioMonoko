import React from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Search, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useAuthContext } from "@/context/AuthContext";
import { useNotificationContext } from "@/context/NotificationContext";
import { useTranslation } from "react-i18next";

/**
 * PrivateHeader : En-tête personnalisé pour l'espace connecté.
 * Gère l'identité visuelle de l'utilisateur et l'accès aux notifications réelles.
 * Le badge de la cloche reflète en temps réel le nombre de notifications non lues grâce au contexte de notifications.
 */
export const PrivateHeader = ({ user }: { user: User }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  // Nombre de notifications non lues
  const { unreadCount } = useNotificationContext();
  const hasUnread = unreadCount > 0;

  // Détection du thème dynamique
  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;

  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-6">

      {/* Identité utilisateur */}
      <View className="flex-row items-center">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/profile")}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
          }}
          className="w-11 h-11 rounded-[16px] items-center justify-center border mr-3 shadow-sm"
        >
          <Text style={{ color: colors.text }} className="font-black text-lg uppercase">
            {(user.username ?? t('home.privateHeader.defaultUsername'))[0]}
          </Text>
        </TouchableOpacity>

        <View>
          <Text
            style={{ color: colors.muted }}
            className="text-[9px] font-black uppercase tracking-[2px]"
          >
            Radio Monoko
          </Text>
          <Text
            style={{ color: colors.text }}
            className="text-xl font-black tracking-tighter italic"
          >
            {t('home.privateHeader.greeting', { username: user.username ?? t('home.privateHeader.defaultUsername') })}
          </Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View className="flex-row gap-x-3">
        {/* Bouton Recherche */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
          }}
          className="p-2.5 rounded-full border"
          activeOpacity={0.6}
        >
          <Search size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Bouton Notifications */}
        <TouchableOpacity
          onPress={() => router.push("/notifications/notifications")}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
          }}
          className="p-2.5 rounded-full border relative"
          activeOpacity={0.6}
        >
          <Bell size={20} color={colors.text} />

          {/* Badge, affiché uniquement s'il existe au moins une notification non lue */}
          {hasUnread && (
            <View
              style={{
                backgroundColor: colors.live,
                borderColor: colors.surface,
                position: 'absolute',
                top: 2,
                right: 2,
                width: 10,
                height: 10,
                borderRadius: 5,
                borderWidth: 2
              }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};