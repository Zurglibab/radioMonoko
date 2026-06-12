import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Bell, Heart, MessageSquare, UserPlus, Sparkles, CheckCheck } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { useNotificationContext } from "@/context/NotificationContext";
import { NotificationType } from "@/types/content";

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemeColors();

  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    unreadCount,
    refetch,
  } = useNotificationContext();

  useFocusEffect(useCallback(() => { refetch(true); }, [refetch]));

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'like': return <Heart size={18} color={colors.live} />;
      case 'comment': return <MessageSquare size={18} color="#38BDF8" />;
      case 'follow': return <UserPlus size={18} color="#A855F7" />;
      default: return <Sparkles size={18} color="#FBBF24" />;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/10 p-2 rounded-full mr-4 active:opacity-60"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
            {t('notifications.screen.title')}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center active:opacity-50">
            <CheckCheck size={16} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="ml-2 text-[10px] font-black uppercase tracking-widest">
              {t('notifications.screen.markAllRead')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : error ? (
          <View className="items-center mt-20">
            <Bell size={48} color={colors.border} />
            <Text style={{ color: colors.muted }} className="mt-4 font-bold italic text-center">
              {error}
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="items-center mt-20">
            <Bell size={48} color={colors.border} />
            <Text style={{ color: colors.muted }} className="mt-4 font-bold italic">
              {t('notifications.screen.emptyState')}
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => !item.isRead && markAsRead(item.id)}
              className="flex-row items-start py-6 border-b"
              style={{
                borderBottomColor: colors.border,
                opacity: item.isRead ? 0.6 : 1
              }}
            >
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: colors.surface }}
              >
                {getIcon(item.type)}
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-start">
                  <Text style={{ color: colors.text }} className="font-black text-sm">
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <View
                      className="w-2 h-2 rounded-full mt-1"
                      style={{ backgroundColor: colors.live }}
                    />
                  )}
                </View>
                <Text style={{ color: colors.muted }} className="text-xs mt-1 leading-4">
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}