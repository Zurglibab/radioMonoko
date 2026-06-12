import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Library,
  Search,
  User,
  Newspaper,
  MessageSquare,
} from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthContext } from "@/context/AuthContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { appearanceSettings } = useAuthContext();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const activeColor = appearanceSettings.accentColor;
  const baseHeight = 58;
  const bottom = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: baseHeight + bottom,
          paddingBottom: bottom,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: Platform.OS === "ios" ? 2 : 0,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('common.nav.home'),
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: t('common.nav.feed'),
          tabBarIcon: ({ color }) => <Newspaper size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: t('common.nav.search'),
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: t('common.nav.library'),
          tabBarIcon: ({ color }) => <Library size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: t('common.nav.chat'),
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('common.nav.profile'),
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
