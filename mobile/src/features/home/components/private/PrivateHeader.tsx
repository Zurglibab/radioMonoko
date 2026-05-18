import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { Search, Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { User } from "@/types/auth";
import { useAuthContext } from "@/context/AuthContext";
import { NotificationService } from "@/services/notifications/notification.service";

/**
 * PrivateHeader : En-tête personnalisé pour l'espace connecté.
 * Gère l'identité visuelle de l'utilisateur et l'accès aux notifications réelles.
 */
export const PrivateHeader = ({ user }: { user: User }) => {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  
  // État pour suivre les notifications non lues
  const [hasUnread, setHasUnread] = useState(false);

  // Détection du thème dynamique
  const isDark = appearanceSettings.themeMode === 'system' 
    ? systemTheme === 'dark' 
    : appearanceSettings.themeMode === 'dark';
        
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * Effet pour vérifier les notifications au montage
   * Dans un projet réel, on utiliserait un Context ou un intervalle (polling)
   */
  useEffect(() => {
    const checkNotifications = async () => {
      const notifs = await NotificationService.getNotifications();
      const unread = notifs.some(n => !n.isRead);
      setHasUnread(unread);
    };
    checkNotifications();
  }, []);

  return (
    <View className="flex-row justify-between items-center px-6 pt-4 mb-6">
      
      {/* SECTION GAUCHE : IDENTITÉ */}
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
            {user.username[0]}
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
            Salut, {user.username}
          </Text>
        </View>
      </View>

      {/* SECTION DROITE : ACTIONS RAPIDES */}
      <View className="flex-row gap-x-3">
        {/* BOUTON RECHERCHE */}
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

        {/* BOUTON NOTIFICATIONS */}
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
          
          {/* BADGE DYNAMIQUE : S'affiche uniquement si non lu */}
          {hasUnread && (
            <View 
              style={{ 
                backgroundColor: colors.live, // Rouge vibrant du thème
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