import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Send, Star } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useAuthContext } from "@/context/AuthContext";

/**
 * ReviewScreen : Écran de rédaction de critique et de notation.
 * Permet à l'utilisateur d'attribuer une note de 1 à 5 étoiles et de rédiger 
 * un avis textuel sur un média spécifique.
 */
export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Récupération de l'ID du média via l'URL
  const { favorites, postReview } = useLibrary();
  const { appearanceSettings } = useAuthContext();

  /**
   * RÉCUPÉRATION DU MÉDIA :
   * On identifie l'objet Station pour afficher le contexte (Image, Titre) 
   * en haut du formulaire de rédaction.
   */
  const station = useMemo(() => favorites.find(s => s.id === id), [id, favorites]);

  // États locaux pour gérer la note, le commentaire et l'état d'envoi
  const [rating, setRating] = useState(0);    // Note sélectionnée (0 par défaut)
  const [comment, setComment] = useState(""); // Contenu textuel de la critique
  const [isSubmitting, setIsSubmitting] = useState(false); // Feedback visuel d'envoi

  /**
   * Gestion du thème dynamique : On choisit les couleurs à appliquer selon la préférence de l'utilisateur
   * et le thème du système. Cela permet une expérience cohérente et personnalisée.
   * Détection du thème (Priorité Dark)
   */
  const isDark = appearanceSettings.themeMode === 'system' ? true : appearanceSettings.themeMode === 'dark';
  const colors = isDark ? theme.dark.colors : theme.light.colors;

  /**
   * handlePublish : Validation et envoi de la critique.
   * Vérifie la présence d'une note et une longueur minimale de texte.
   */
  const handlePublish = async () => {
    // Note obligatoire
    if (rating === 0) {
      Alert.alert("Note requise", "Veuillez attribuer au moins une étoile.");
      return;
    }
    // Critique constructive avec 5 caractères minimum
    if (comment.trim().length < 5) {
      Alert.alert("Critique trop courte", "Dites-en un peu plus sur votre écoute.");
      return;
    }

    setIsSubmitting(true);
    await postReview(id as string, rating, comment);
    setIsSubmitting(false);
    router.back(); // Retour à la bibliothèque après succès
  };

  /**
   * ratingLabel : Traduction sémantique de la note chiffrée.
    * Permet d'afficher un message personnalisé selon la note choisie.
   */
  const ratingLabel = useMemo(() => {
    const labels = ["", "Décevant", "Pas mal", "Très bon", "Excellent", "Chef-d'œuvre"];
    return labels[rating];
  }, [rating]);

  // Sécurité si l'ID est invalide ou le média introuvable
  if (!station) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* KeyboardAvoidingView : Évite que le clavier mobile ne masque le champ de saisie */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        {/* Header : Navigation retour et Titre stylisé */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="p-2 rounded-full border active:opacity-60"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
            Critique
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Rappel du média concerné */}
          <View 
            className="flex-row items-center mt-6 mb-10 p-4 rounded-[16px] border border-dashed" 
            style={{ borderColor: colors.border }}
          >
            <Image source={{ uri: station.imageUrl }} className="w-12 h-12 rounded-xl" />
            <View className="ml-4 flex-1">
              <Text style={{ color: colors.text }} className="font-bold text-sm" numberOfLines={1}>
                {station.title}
              </Text>
              <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest">
                {station.artist}
              </Text>
            </View>
          </View>

          {/* Système d'étoiles interactif */}
          <View className="items-center mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[3px] mb-4">
              Note l'onde
            </Text>
            <View className="flex-row gap-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <Star 
                    size={36} 
                    color={star <= rating ? colors.primary : colors.muted} 
                    fill={star <= rating ? colors.primary : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: colors.text }} className="mt-4 font-bold italic opacity-60">
              {rating === 0 ? "Choisis ton intensité" : `${rating}/5 - ${ratingLabel}`}
            </Text>
          </View>

          {/* Saisie libre de l'avis */}
          <View className="mb-8">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[3px] ml-1 mb-2">
              Ton avis
            </Text>
            <TextInput
              multiline
              placeholder="Cette radio me rappelle..."
              placeholderTextColor={colors.muted}
              value={comment}
              onChangeText={setComment}
              style={{ 
                backgroundColor: colors.surface, 
                color: colors.text, 
                minHeight: 150,
                textAlignVertical: 'top' // Indispensable sur Android pour le texte multiligne
              }}
              className="w-full p-6 rounded-[32px] border border-white/5 font-medium leading-6"
            />
          </View>

          {/* Diffusion sur le réseau */}
          <TouchableOpacity 
            onPress={handlePublish}
            disabled={isSubmitting}
            style={{ 
              backgroundColor: colors.primary,
              opacity: isSubmitting ? 0.6 : 1 
            }}
            className="w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-lg active:scale-[0.98]"
          >
            <Send size={18} color={colors.secondary} className="mr-2" />
            <Text style={{ color: colors.secondary }} className="font-black uppercase tracking-[2px] text-xs">
              Diffuser ma critique
            </Text>
          </TouchableOpacity>

          {/* Note de confidentialité */}
          <Text style={{ color: colors.muted }} className="text-[10px] text-center mt-6 italic">
            Ta critique sera visible par toute la communauté RadioMonoco.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}