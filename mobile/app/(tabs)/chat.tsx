import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, useColorScheme, RefreshControl,
  Modal, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { MessageSquare, Plus, X, Search } from "lucide-react-native";
import { theme } from "@/constants/theme";
import { useAuthContext } from "@/context/AuthContext";
import { useConversations, Conversation } from "@/hooks/chat/useConversations";
import { SocialService } from "@/services/social/social.service";
import { ChannelService } from "@/services/chat/channel.service";
import { Friend } from "@/types/social";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ name, avatar, size = 48, colors }: { name: string; avatar?: string; size?: number; colors: any }) {
  if (avatar) {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "900", fontSize: size * 0.35, textTransform: "uppercase" }}>
        {name[0]}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { appearanceSettings, token, user } = useAuthContext();
  const systemTheme = useColorScheme();
  const router = useRouter();

  const isDark =
    appearanceSettings.themeMode === "system"
      ? systemTheme === "dark"
      : appearanceSettings.themeMode === "dark";
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  const { conversations, isLoading, refetch } = useConversations();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { refetch(true); }, [refetch]));

  const openPicker = async () => {
    setPickerVisible(true);
    setFriendsLoading(true);
    try {
      const list = await SocialService.fetchMyFriends(token!);
      setFriends(list);
    } catch {
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const closePicker = () => {
    setPickerVisible(false);
    setSearch("");
  };

  const handleStartChat = async (friend: Friend) => {
    if (!token || !user?.id || startingChat) return;
    setStartingChat(friend.id);
    try {
      const channelId = await ChannelService.getOrCreateDM(token, user.id, friend.id);
      const name = (friend as any).display_name ?? friend.username;
      closePicker();
      router.push(`/chat/${channelId}?username=${encodeURIComponent(name)}` as any);
    } catch (err) {
      if (__DEV__) console.warn("[ChatScreen] startChat failed:", err);
    } finally {
      setStartingChat(null);
    }
  };

  const filteredFriends = search.trim()
    ? friends.filter(f =>
        f.username.toLowerCase().includes(search.toLowerCase()) ||
        ((f as any).display_name ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : friends;

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/chat/${item.channelId}?username=${encodeURIComponent(item.otherUsername)}` as any
        )
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      activeOpacity={0.7}
    >
      <Avatar name={item.otherUsername} avatar={item.otherAvatar} colors={colors} />
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }} numberOfLines={1}>
          {item.otherUsername}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
          {item.lastMessage || "Démarrer la conversation"}
        </Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 11 }}>
        {formatTime(item.lastMessageAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900", fontStyle: "italic" }}>
          Messages
        </Text>
        <TouchableOpacity
          onPress={openPicker}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MessageSquare size={48} color={colors.border} />
          <Text
            style={{ color: colors.muted, textAlign: "center", fontSize: 15, lineHeight: 24, fontWeight: "700", fontStyle: "italic", marginTop: 16 }}
          >
            Aucun message pour l'instant.{"\n"}
            <Text style={{ color: colors.primary }}>Appuie sur +</Text> pour démarrer une conversation.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.channelId}
          renderItem={renderConversation}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch(false)}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={<View style={{ height: 32 }} />}
        />
      )}

      {/* Sélecteur de contact */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePicker}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header modal */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: "900", fontStyle: "italic" }}>
              Nouvelle conversation
            </Text>
            <TouchableOpacity onPress={closePicker} hitSlop={12}>
              <X size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              margin: 16,
              paddingHorizontal: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
            }}
          >
            <Search size={16} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un ami..."
              placeholderTextColor={colors.muted}
              style={{
                flex: 1,
                marginLeft: 8,
                paddingVertical: 10,
                color: colors.text,
                fontSize: 15,
              }}
            />
          </View>

          {friendsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : filteredFriends.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ color: colors.muted, fontStyle: "italic" }}>
                {search ? "Aucun résultat" : "Aucun ami pour l'instant"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFriends}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const displayName = (item as any).display_name ?? item.username;
                const isLoading = startingChat === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => handleStartChat(item)}
                    disabled={!!startingChat}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      opacity: startingChat && !isLoading ? 0.5 : 1,
                    }}
                  >
                    <Avatar name={displayName} avatar={(item as any).avatar} colors={colors} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
                        {displayName}
                      </Text>
                      {(item as any).display_name && (
                        <Text style={{ color: colors.muted, fontSize: 12 }}>@{item.username}</Text>
                      )}
                    </View>
                    {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
