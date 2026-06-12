import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { X, Globe, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "@/utils/useThemeColors";

export interface CollectionFormData {
  name: string;
  description: string;
  isPublic: boolean;
}

interface CollectionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  initialData?: Partial<CollectionFormData>;
  title?: string;
}

export const CollectionFormModal = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  title,
}: CollectionFormModalProps) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const modalTitle = title ?? t('library.collectionFormModal.defaultTitle');

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(initialData?.name ?? "");
      setDescription(initialData?.description ?? "");
      setIsPublic(initialData?.isPublic ?? false);
      setError(null);
    }
  }, [visible, initialData]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError(t('library.collectionFormModal.nameTooShort'));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, description: description.trim(), isPublic });
      onClose();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <View
          style={{ backgroundColor: colors.background, borderColor: colors.border }}
          className="rounded-t-[40px] border-t border-x px-6 pt-6 pb-10"
        >
          <View className="flex-row justify-between items-center mb-8">
            <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
              {modalTitle}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: colors.surface }}
              className="p-2 rounded-full active:opacity-60"
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
            {t('library.collectionFormModal.nameLabel')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('library.collectionFormModal.namePlaceholder')}
            placeholderTextColor={colors.muted}
            style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
            className="w-full px-5 py-4 rounded-2xl border mb-5 font-medium"
          />

          <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
            {t('library.collectionFormModal.descriptionLabel')}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('library.collectionFormModal.descriptionPlaceholder')}
            placeholderTextColor={colors.muted}
            multiline
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            className="w-full px-5 py-4 rounded-2xl border mb-5 font-medium"
          />

          <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
            {t('library.collectionFormModal.visibilityLabel')}
          </Text>
          <View className="flex-row gap-x-3 mb-6">
            <TouchableOpacity
              onPress={() => setIsPublic(false)}
              style={{
                backgroundColor: !isPublic ? colors.primary : colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border"
            >
              <Lock size={16} color={!isPublic ? colors.secondary : colors.muted} />
              <Text
                style={{ color: !isPublic ? colors.secondary : colors.muted }}
                className="ml-2 font-bold text-xs"
              >
                {t('common.private')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPublic(true)}
              style={{
                backgroundColor: isPublic ? colors.primary : colors.surface,
                borderColor: colors.border,
              }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border"
            >
              <Globe size={16} color={isPublic ? colors.secondary : colors.muted} />
              <Text
                style={{ color: isPublic ? colors.secondary : colors.muted }}
                className="ml-2 font-bold text-xs"
              >
                {t('common.public')}
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={{ color: colors.danger }} className="text-xs font-bold mb-4 text-center">
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 }}
            className="w-full py-5 rounded-2xl items-center justify-center active:scale-[0.98]"
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={{ color: colors.secondary }} className="font-black uppercase tracking-[2px] text-xs">
                {initialData ? t('common.save') : t('library.collectionFormModal.createButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};