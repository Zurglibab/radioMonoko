import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

/**
 * LibraryQuickNav : Barre de navigation rapide pour la bibliothèque.
 * Permet de basculer entre différentes catégories ou états de lecture
 * via un défilement horizontal fluide.
 */
export const LibraryQuickNav = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const isDark = appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const statuses = [
    { label: t('home.libraryQuickNav.statusInProgress'), route: "/library/status/in-progress" },
    { label: t('home.libraryQuickNav.statusToListen'), route: "/library/status/to-listen" },
    { label: t('home.libraryQuickNav.statusFavorites'), route: "/playlist/liked" },
    { label: t('home.libraryQuickNav.statusArchives'), route: "/library/status/dropped" },
    { label: t('home.libraryQuickNav.statusMixes'), route: "/library?tab=Playlists" },
  ];

  return (
    <View className="mb-10">
      {/* Affichage du titre de la section */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <Text
          style={{ color: colors.text }}
          className="text-lg font-bold tracking-tight"
        >
          {t('home.libraryQuickNav.title')}
        </Text>

        <TouchableOpacity activeOpacity={0.6} onPress={() => router.push("/library" as any)}>
          <Text
            style={{ color: colors.muted }}
            className="text-xs font-bold uppercase tracking-widest"
          >
            {t('home.libraryQuickNav.manage')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6"
        contentContainerStyle={{ paddingRight: 40 }}
      >
        {statuses.map((status, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => router.push(status.route as any)}
            className="mr-3 px-6 py-3 rounded-2xl border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
          >
            <Text
              style={{ color: colors.text }}
              className="text-xs font-semibold"
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};