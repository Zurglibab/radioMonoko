import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Check, Info, RotateCcw, Globe, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";
import { useLibrary } from "@/hooks/home/useLibrary";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateProfile, checkDisplayNameCooldown } = useLibrary();
  const colors = useThemeColors();

  const initialDisplayName = user?.display_name || user?.username || "";
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(user?.bio || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [privacy, setPrivacy] = useState<'public' | 'private'>(user?.privacy || 'public');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);

  const cooldown = useMemo(() => checkDisplayNameCooldown(), [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t("profile.editProfile.permissionDeniedTitle"), t("profile.editProfile.permissionDeniedMessage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const hasChanged = useMemo(() => {
    const nameChanged = displayName.trim() !== initialDisplayName;
    const bioChanged = bio.trim() !== (user?.bio || "");
    const websiteChanged = website.trim() !== (user?.website || "");
    const avatarChanged = avatar !== (user?.avatar || null);
    const privacyChanged = privacy !== (user?.privacy || 'public');
    return nameChanged || bioChanged || websiteChanged || avatarChanged || privacyChanged;
  }, [displayName, bio, website, avatar, privacy, user, initialDisplayName]);

  const isNameValid = displayName.trim().length >= 3;
  const isNameLockedByCooldown = !!user?.display_name && displayName.trim() !== initialDisplayName && !cooldown.allowed;

  const isSaveDisabled = !hasChanged || !isNameValid || isNameLockedByCooldown || isSaving;

  const handleSave = async () => {
    if (isSaveDisabled) return;
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
        website: website.trim(),
        avatar: avatar || undefined,
        privacy,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ProfileHeader title={t("profile.editProfile.headerTitle")} colors={colors} />

        <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-10">
            <TouchableOpacity activeOpacity={0.9} onPress={pickImage} className="relative">
              <Image
                source={{ uri: avatar || `https://ui-avatars.com/api/?name=${displayName}&background=333&color=fff` }}
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                className="w-32 h-32 rounded-[40px] border-2"
              />
              <View
                style={{ backgroundColor: colors.primary, borderColor: colors.background }}
                className="absolute bottom-0 right-0 p-2.5 rounded-full border-4"
              >
                <Camera size={18} color={colors.secondary} />
              </View>
            </TouchableOpacity>

            {avatar !== (user?.avatar || null) && (
              <TouchableOpacity
                onPress={() => setAvatar(user?.avatar || null)}
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="mt-4 flex-row items-center px-4 py-2 rounded-full border"
              >
                <RotateCcw size={12} color={colors.muted} />
                <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest ml-2">
                  {t("profile.editProfile.cancelPhoto")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-6">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              {t("profile.editProfile.displayNameLabel")}
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={user?.username}
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
              className="w-full px-5 py-4 rounded-2xl border font-bold text-sm"
            />
            {isNameLockedByCooldown && (
              <View className="flex-row items-center mt-2 px-1">
                <Info size={12} color={colors.danger} />
                <Text style={{ color: colors.danger }} className="text-[10px] ml-1 font-bold italic">
                  {t("profile.editProfile.cooldownMessage", { days: cooldown.remainingDays })}
                </Text>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              {t("profile.editProfile.bioLabel")}
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.editProfile.bioPlaceholder")}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, minHeight: 90, textAlignVertical: 'top' }}
              className="w-full px-5 py-4 rounded-2xl border font-medium text-sm"
            />
          </View>

          <View className="mb-6">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              {t("profile.editProfile.websiteLabel")}
            </Text>
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder={t("profile.editProfile.websitePlaceholder")}
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
              className="w-full px-5 py-4 rounded-2xl border font-bold text-sm"
            />
          </View>

          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              {t("profile.editProfile.privacyLabel")}
            </Text>
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => setPrivacy('public')}
                style={{
                  backgroundColor: privacy === 'public' ? colors.primary : colors.surface,
                  borderColor: privacy === 'public' ? colors.primary : colors.border
                }}
                className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border"
              >
                <Globe size={16} color={privacy === 'public' ? colors.secondary : colors.muted} />
                <Text
                  style={{ color: privacy === 'public' ? colors.secondary : colors.muted }}
                  className="text-[11px] font-black uppercase tracking-widest ml-2"
                >
                  {t("common.public")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPrivacy('private')}
                style={{
                  backgroundColor: privacy === 'private' ? colors.primary : colors.surface,
                  borderColor: privacy === 'private' ? colors.primary : colors.border
                }}
                className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border"
              >
                <Lock size={16} color={privacy === 'private' ? colors.secondary : colors.muted} />
                <Text
                  style={{ color: privacy === 'private' ? colors.secondary : colors.muted }}
                  className="text-[11px] font-black uppercase tracking-widest ml-2"
                >
                  {t("common.private")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaveDisabled}
            activeOpacity={0.8}
            style={{
              backgroundColor: isSaveDisabled ? colors.surface : colors.primary,
              opacity: isSaveDisabled ? 0.5 : 1,
              borderColor: colors.border,
              borderWidth: isSaveDisabled ? 1 : 0
            }}
            className="h-16 rounded-2xl flex-row items-center justify-center shadow-lg"
          >
            {!isSaveDisabled && (
              <Check size={18} color={colors.secondary} style={{ marginRight: 8 }} />
            )}
            <Text
              style={{ color: isSaveDisabled ? colors.muted : colors.secondary }}
              className="font-black uppercase tracking-[2px] text-[11px]"
            >
              {hasChanged ? t("profile.editProfile.saveButton") : t("profile.editProfile.noChanges")}
            </Text>
          </TouchableOpacity>

          <View
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="mt-8 mb-10 p-6 rounded-[32px] border border-dashed"
          >
             <Text style={{ color: colors.muted }} className="text-[10px] text-center leading-4">
              {t("profile.editProfile.securityNotePrefix")}<Text style={{ color: colors.text }} className="font-bold">@{user?.username}</Text>{t("profile.editProfile.securityNoteSuffix")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
