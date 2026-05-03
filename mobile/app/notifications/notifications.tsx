import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Bell, Heart, MessageSquare, UserPlus, Sparkles, CheckCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { NotificationService } from "@/services/notifications/notification.service";
import { AppNotification } from "@/types/content";

/**
 * NotificationsScreen : Centre de notifications de l'utilisateur.
 * Affiche l'historique des interactions (Likes, Follows, Commentaires) et 
 * les recommandations système. Répond aux exigences de mise à jour en temps réel.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { appearanceSettings } = useAuthContext();
  const systemTheme = useColorScheme();
  
  // ÉTATS LOCAUX
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // LOGIQUE DE THÈME
  const isDark = appearanceSettings.themeMode === 'system' ? systemTheme === 'dark' : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * Chargement initial des données au montage du composant.
   */
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await NotificationService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  /**
   * handleMarkRead : Marque une notification comme lue.
   */
  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  /**
   * handleMarkAllRead : Action groupée pour vider les alertes.
   * Utilise le service pour mettre à jour la persistance.
   */
  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  /**
   * getIcon : Helper pour mapper le type de notification à une icône sémantique.
   * Permet à l'utilisateur de scanner rapidement la nature de l'alerte.
   */
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={18} color={theme.dark.colors.live} />;
      case 'comment': return <MessageSquare size={18} color="#38BDF8" />;
      case 'follow': return <UserPlus size={18} color="#A855F7" />;
      default: return <Sparkles size={18} color="#FBBF24" />;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      
      {/* HEADER : Navigation et Action groupée */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white/10 p-2 rounded-full mr-4 active:opacity-60"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
            Alertes
          </Text>
        </View>
        
        {/* Affichage conditionnel du bouton "Tout lire" s'il reste des non-lus */}
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={handleMarkAllRead} className="flex-row items-center active:opacity-50">
            <CheckCheck size={16} color={colors.muted} />
            <Text style={{ color: colors.muted }} className="ml-2 text-[10px] font-black uppercase tracking-widest">
              Tout lire
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} className="mt-10" />
        ) : notifications.length === 0 ? (
          /* EMPTY STATE : Si aucune notification n'est présente */
          <View className="items-center mt-20">
            <Bell size={48} color={colors.border} />
            <Text style={{ color: colors.muted }} className="mt-4 font-bold italic">
              Aucune notification pour le moment
            </Text>
          </View>
        ) : (
          /* RENDU DE LA LISTE */
          notifications.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => handleMarkRead(item.id)}
              className="flex-row items-start py-6 border-b"
              style={{ 
                borderBottomColor: colors.border, 
                // Feedback visuel : les lues sont plus ternes
                opacity: item.isRead ? 0.6 : 1 
              }}
            >
              {/* Conteneur d'icône avec fond de surface */}
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
                  {/* Point indicateur de non-lecture */}
                  {!item.isRead && (
                    <View 
                      className="w-2 h-2 rounded-full mt-1" 
                      style={{ backgroundColor: theme.dark.colors.live }} 
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