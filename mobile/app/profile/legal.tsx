import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Download } from "lucide-react-native";
import { useRouter } from "expo-router";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { AuthService } from "@/services/auth/auth.service";

/**
 * DataPrivacyScreen : Portabilité des données personnelles (RGPD).
 * Permet à l'utilisateur de demander un export complet de ses données.
 */
export default function DataPrivacyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, token, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  const [isExporting, setIsExporting] = useState(false);

  const isDark = appearanceSettings.themeMode === 'system'
    ? systemTheme === 'dark'
    : appearanceSettings.themeMode === 'dark';

  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * Export des données : Conformément au RGPD, l'utilisateur peut télécharger une archive
   * contenant l'intégralité de ses données personnelles et d'activité (profil, favoris,
   * statuts, collections, notes), récupérée directement depuis le backend puis partagée
   * sous forme de fichier JSON.
   */
  const handleExport = async () => {
    if (!token || !user) return;
    setIsExporting(true);
    try {
      const data = await AuthService.exportUserData(token, user.id);
      const file = new File(Paths.cache, `radiomonoko-export-${user.id}.json`);
      if (file.exists) file.delete();
      file.write(JSON.stringify(data, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: t("profile.legal.shareDialogTitle"),
        });
      } else {
        Alert.alert(t("profile.legal.exportReadyTitle"), t("profile.legal.exportReadyMessage", { uri: file.uri }));
      }
    } catch (e) {
      Alert.alert(t("profile.legal.errorTitle"), t("profile.legal.errorMessage"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      {/* Header : Navigation et Titre */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full border shadow-sm active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic ml-4 tracking-tighter">
          {t("profile.legal.headerTitle")}
        </Text>
      </View>

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>

        {/* Portabilité des données */}
        <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mb-4">
          {t("profile.legal.portabilitySection")}
        </Text>
        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="rounded-[16px] p-6 border mb-8 shadow-sm">
          <Text style={{ color: colors.text }} className="font-black text-lg mb-2 italic tracking-tighter">{t("profile.legal.exportArchiveTitle")}</Text>
          <Text style={{ color: colors.muted }} className="text-xs mb-6 leading-5 font-medium">
            {t("profile.legal.exportArchiveDesc")}
          </Text>

          <TouchableOpacity
            onPress={handleExport}
            disabled={isExporting}
            style={{ backgroundColor: colors.primary }}
            className="h-14 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
          >
            {isExporting ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <>
                <Download size={18} color={colors.secondary} />
                <Text style={{ color: colors.secondary }} className="font-black uppercase text-[10px] ml-2 tracking-[2px]">{t("profile.legal.generateArchiveButton")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer : Versionning de l'application */}
        <Text className="text-center mb-10 text-[9px] uppercase font-black tracking-[2px] opacity-40" style={{ color: colors.muted }}>
          {t("profile.legal.footer")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
