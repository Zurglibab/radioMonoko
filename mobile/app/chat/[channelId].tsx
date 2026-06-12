import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { useChat, ChatMessage } from "@/hooks/chat/useChat";
import { formatMessageTime } from "@/utils/dateFormat";

export default function ChatConversationScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { channelId, username } = useLocalSearchParams<{
    channelId: string;
    username?: string;
  }>();

  const colors = useThemeColors();

  const { messages, isLoading, isSending, sendMessage, deleteMessage } = useChat(channelId);

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 80);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  }, [input, sendMessage]);

  const handleLongPress = useCallback(
    (msg: ChatMessage) => {
      if (!msg.isMine || msg.isOptimistic) return;
      Alert.alert(t("chat.channel.messageAlertTitle"), undefined, [
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteMessage(msg.id),
        },
        { text: t("common.cancel"), style: "cancel" },
      ]);
    },
    [deleteMessage, t]
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const prev = index > 0 ? messages[index - 1] : null;
      const showName = !item.isMine && (!prev || prev.senderId !== item.senderId);

      return (
        <TouchableOpacity
          onLongPress={() => handleLongPress(item)}
          activeOpacity={item.isMine ? 0.7 : 1}
          style={{
            paddingHorizontal: 16,
            marginBottom: 4,
            alignItems: item.isMine ? "flex-end" : "flex-start",
          }}
        >
          {showName ? (
            <Text
              key="name"
              style={{ color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 2, marginLeft: 4 }}
            >
              {item.senderName}
            </Text>
          ) : null}
          <View
            key="bubble"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              maxWidth: "78%",
              backgroundColor: item.isMine ? colors.primary : colors.surface,
              borderWidth: item.isMine ? 0 : 1,
              borderColor: colors.border,
              opacity: item.isOptimistic ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: item.isMine ? colors.background : colors.text,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              {item.content}
            </Text>
          </View>
          <Text
            key="time"
            style={{ color: colors.muted, fontSize: 10, marginTop: 2, marginHorizontal: 4 }}
          >
            {formatMessageTime(item.timestamp, i18n.language)}
          </Text>
        </TouchableOpacity>
      );
    },
    [messages, colors, handleLongPress, i18n.language]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            borderRadius: 99,
            marginRight: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{ color: colors.text, fontSize: 17, fontWeight: "900", fontStyle: "italic", flex: 1 }}
          numberOfLines={1}
        >
          {username ?? t("chat.channel.defaultTitle")}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 }}>
                <Text style={{ color: colors.muted, fontStyle: "italic", fontSize: 14 }}>
                  {t("chat.channel.sayHello")}
                </Text>
              </View>
            }
          />
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={t("chat.channel.inputPlaceholder")}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              color: colors.text,
              fontSize: 15,
              maxHeight: 120,
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isSending || !input.trim()}
            style={{
              marginLeft: 8,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: input.trim() ? colors.primary : colors.surface,
              borderWidth: input.trim() ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Send size={18} color={input.trim() ? colors.background : colors.muted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}