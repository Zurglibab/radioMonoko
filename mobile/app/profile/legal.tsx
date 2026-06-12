import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Download } from "lucide-react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/context/AuthContext";
import { useThemeColors } from "@/utils/useThemeColors";
import { AuthService } from "@/services/auth/auth.service";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";

export default function DataPrivacyScreen() {
  const { t } = useTranslation();
  const { user, token } = useAuthContext();
  const colors = useThemeColors();

  const [isExporting, setIsExporting] = useState(false);

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
      <ProfileHeader title={t("profile.legal.headerTitle")} colors={colors} />

      <ScrollView className="px-6 mt-6" showsVerticalScrollIndicator={false}>
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

        <Text className="text-center mb-10 text-[9px] uppercase font-black tracking-[2px] opacity-40" style={{ color: colors.muted }}>
          {t("profile.legal.footer")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
