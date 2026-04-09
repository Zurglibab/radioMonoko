import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Bell, Radio, Mic2, ShieldAlert } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";

/**
 * NotificationsScreen : Gestion des préférences Push.
 * Permet de filtrer finement les types d'alertes envoyées sur le téléphone.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationSettings, updateNotifications, appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
    
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * NotificationOption : Composant interne pour chaque ligne de réglage.
   */
  const NotificationOption = ({ icon: Icon, label, secondary, value, onValueChange, isLast = false }: any) => (
    <View 
      style={{ borderBottomColor: colors.border }}
      className={`flex-row items-center py-5 mx-4 ${!isLast ? 'border-b' : ''}`}
    >
      {/* Icône de catégorie */}
      <View style={{ backgroundColor: colors.background }} className="w-10 h-10 rounded-xl items-center justify-center">
        <Icon size={20} color={colors.text} />
      </View>

      {/* Libellés */}
      <View className="flex-1 ml-4">
        <Text style={{ color: colors.text }} className="font-bold text-sm">{label}</Text>
        <Text style={{ color: colors.muted }} className="text-[10px] uppercase font-black tracking-tighter">
          {secondary}
        </Text>
      </View>

      {/* Interrupteur */}
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.live + '80' }} // Opacité 50% sur le track
        thumbColor={value ? colors.live : (isDark ? "#444" : "#F4F3F4")}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* Header : Navigation retour */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="p-2 rounded-full mr-4 border active:opacity-60"
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
          Notifications
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* Illustration de section */}
        <View className="items-center mb-10">
          <View 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="w-20 h-20 rounded-[32px] items-center justify-center border shadow-sm"
          >
            <Bell size={40} color={colors.live} />
          </View>
          <Text style={{ color: colors.text }} className="font-black mt-4 text-lg italic tracking-tighter text-center">
            Alertes & Ondes
          </Text>
        </View>

        {/* Préférences éditoriales (Radios & Podcasts) */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border mb-6 shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">
            Diffusion
          </Text>
          
          <NotificationOption 
            icon={Radio} 
            label="Direct & Live" 
            secondary="Alertes quand vos radios préférées sont en direct"
            value={notificationSettings.pushDirect}
            onValueChange={(val: boolean) => updateNotifications('pushDirect', val)}
          />
          
          <NotificationOption 
            icon={Mic2} 
            label="Nouveaux Podcasts" 
            secondary="Sortie des nouveaux épisodes suivis"
            value={notificationSettings.pushPodcasts}
            onValueChange={(val: boolean) => updateNotifications('pushPodcasts', val)}
            isLast={true}
          />
        </View>

        {/* Sécurité et compte */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="rounded-[32px] p-2 border shadow-sm"
        >
          <Text style={{ color: colors.muted }} className="text-[9px] font-black uppercase tracking-[3px] ml-4 mt-4 mb-2">
            Système
          </Text>
          
          <NotificationOption 
            icon={ShieldAlert} 
            label="Sécurité & Compte" 
            secondary="Alertes de connexion et mises à jour critiques"
            value={notificationSettings.pushSecurity}
            onValueChange={(val: boolean) => updateNotifications('pushSecurity', val)}
            isLast={true}
          />
        </View>

        {/* Note de protection de la vie privée */}
        <View 
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          className="mt-10 p-6 rounded-[32px] border border-dashed"
        >
          <Text style={{ color: colors.muted }} className="text-[10px] leading-4 text-center italic font-medium">
            RadioMonoco respecte votre temps d'écoute. Nous n'envoyons que les notifications essentielles à votre expérience.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}