import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings, LogOut, ShieldCheck, Bell, CircleHelp,
  Share2, User, Paintbrush, FileText,
} from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useRouter } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";
import { usePendingRequests } from "@/hooks/profile/usePendingRequests";
import { PendingRequestsSection } from "@/features/profile/components/PendingRequestsSection";
import { SettingItem } from "@/features/profile/components/SettingItem";

const StatBox = ({ label, value, colors }: { label: string; value: number | string; colors: any }) => (
  <View
    style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    className="items-center justify-center p-5 rounded-[16px] w-[31%] border"
  >
    <Text style={{ color: colors.text }} className="text-2xl font-black italic tracking-tighter">{value}</Text>
    <Text style={{ color: colors.muted }} className="text-[8px] uppercase font-black tracking-widest mt-1">{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const { user, favorites, playlists, statusItems } = useLibrary();
  const { token, logout, appearanceSettings } = useAuthContext();
  const router = useRouter();
  const systemTheme = useColorScheme();

  const isDark = appearanceSettings.themeMode === "system"
    ? systemTheme === "dark"
    : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const { requests, isLoading: pendingLoading, respondingId, accept, refuse } = usePendingRequests(token);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment quitter Radio Monoko ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>

      <View className="px-6 pb-2">
        <View className="flex-row items-center justify-between mt-6">
          <Text style={{ color: colors.text }} className="text-3xl font-black italic tracking-tighter">Moi</Text>
          <TouchableOpacity style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="p-2.5 rounded-full border">
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View className="items-center mt-8">
          <View className="relative">
            <Image
              source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=333&color=fff` }}
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              className="w-32 h-32 rounded-[40px] border-2"
            />
            <View
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 items-center justify-center"
              style={{ backgroundColor: colors.primary, borderColor: colors.background }}
            >
              <User size={12} color={colors.secondary} />
            </View>
          </View>

          <Text style={{ color: colors.text }} className="text-3xl font-black mt-6 tracking-tighter">{user.username}</Text>
          <Text style={{ color: colors.muted }} className="font-bold mb-3 uppercase text-[10px] tracking-[2px]">{user.email}</Text>

          <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="px-6 py-2 rounded-full border">
            <Text style={{ color: colors.muted }} className="text-[11px] font-medium">Radio Monoko • Membre depuis Mars 2026</Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-10">
          <StatBox colors={colors} label="Ondes" value={favorites.length} />
          <StatBox colors={colors} label="Playlists" value={playlists.length} />
          <StatBox colors={colors} label="Terminés" value={statusItems.find((i) => i.slug === "finished")?.count ?? 0} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6 mt-4">
        <PendingRequestsSection
          requests={requests}
          isLoading={pendingLoading}
          respondingId={respondingId}
          onAccept={accept}
          onRefuse={refuse}
          colors={colors}
        />

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-8 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">Mon Compte</Text>
          <SettingItem icon={User} label="Modifier le profil" secondary="Pseudo, Bio, Photo" onPress={() => router.push("/profile/edit")} colors={colors} />
          <SettingItem icon={ShieldCheck} label="Sécurité" secondary="Mot de passe, 2FA" onPress={() => router.push("/profile/security")} isLast colors={colors} />
        </View>

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-6 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">Expérience</Text>
          <SettingItem icon={Bell} label="Notifications" secondary="Alertes direct, Podcasts" onPress={() => router.push("/profile/notifications")} colors={colors} />
          <SettingItem icon={Paintbrush} label="Apparence" secondary="Thèmes, Icones" onPress={() => router.push("/profile/appearance")} colors={colors} />
          <SettingItem icon={Share2} label="Parrainage" secondary="Inviter des amis" isLast colors={colors} />
        </View>

        <View style={{ backgroundColor: colors.surface, borderColor: colors.border }} className="mt-6 rounded-[16px] p-2 border">
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">Assistance</Text>
          <SettingItem icon={CircleHelp} label="Assistance" secondary="FAQ, Contact, Aide" onPress={() => router.push("/profile/support")} colors={colors} />
          <SettingItem icon={FileText} label="Légal" secondary="CGU, Confidentialité, Export" onPress={() => router.push("/profile/legal")} isLast colors={colors} />
        </View>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} className="flex-row items-center justify-center py-10 mb-10">
          <LogOut size={18} color={colors.primary} />
          <Text style={{ color: colors.primary }} className="ml-3 font-black uppercase text-xs tracking-[3px]">Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
