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
  useColorScheme
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera, Check, Info, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { theme } from "@/constants/theme";
import { useLibrary } from "@/hooks/home/useLibrary";
import { useAuthContext } from "@/context/AuthContext";

/**
 * EditProfileScreen : Formulaire d'édition du compte utilisateur.
 * Gère le changement d'avatar, de pseudonyme (avec cooldown) et d'email.
 */
export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, checkUsernameCooldown } = useLibrary();
  const { appearanceSettings } = useAuthContext();
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

  // États locaux pour gérer les champs du formulaire
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  
  // Vérification des contraintes de changement de nom
  const cooldown = useMemo(() => checkUsernameCooldown(), [user]);

  /**
   * pickImage : Utilise expo-image-picker pour sélectionner une nouvelle photo.
   */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès aux photos est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // On ne veut que des photos
      allowsEditing: true,    // Crop carré forcé
      aspect: [1, 1],
      quality: 0.7,           // Optimisation du poids de l'image
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  /**
   * hasChanged : Logique de détection de modification.
   * Compare l'état local avec l'état initial du store.
   */
  const hasChanged = useMemo(() => {
    const nameChanged = username.trim() !== (user?.username || "");
    const emailChanged = email.trim() !== (user?.email || "");
    const avatarChanged = avatar !== (user?.avatar || null);
    return nameChanged || emailChanged || avatarChanged;
  }, [username, email, avatar, user]);

  /**
   * Validation du pseudonyme :
   * Doit être différent de l'actuel
   * Doit faire au moins 3 caractères
   * Doit respecter le cooldown de changement (7 jours)
   * Si le pseudonyme est verrouillé par le cooldown, on affiche un message d'attente.
   */
  const isPseudoValid = username.trim().length >= 3;
  const isPseudoLockedByCooldown = username.trim() !== user?.username && !cooldown.allowed;
  
  // Le bouton est désactivé si rien n'a changé OU si les règles ne sont pas respectées
  const isSaveDisabled = !hasChanged || !isPseudoValid || isPseudoLockedByCooldown;

  /**
   * handleSave : Enregistre les modifications et ferme l'écran.
   */
  const handleSave = async () => {
    if (isSaveDisabled) return;
    await updateProfile(username.trim(), email.trim(), avatar || undefined);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* KeyboardAvoidingView : Évite que le clavier ne cache les inputs sur iOS */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        
        {/* Header : Navigation retour */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="p-2 rounded-full mr-4 border"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text }} className="text-xl font-black italic tracking-tighter">
            Édition Profil
          </Text>
        </View>

        <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
          
          {/* Image de profil avec badge caméra */}
          <View className="items-center mb-10">
            <TouchableOpacity activeOpacity={0.9} onPress={pickImage} className="relative">
              <Image 
                source={{ uri: avatar || `https://ui-avatars.com/api/?name=${username}&background=333&color=fff` }} 
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

            {/* Permet d'annuler le changement d'image avant sauvegarde */}
            {avatar !== user?.avatar && (
              <TouchableOpacity 
                onPress={() => setAvatar(user?.avatar || null)} 
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="mt-4 flex-row items-center px-4 py-2 rounded-full border"
              >
                <RotateCcw size={12} color={colors.muted} />
                <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-widest ml-2">
                  Annuler la photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Formulaire - Pseudonyme */}
          <View className="mb-6">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              Pseudonyme
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
              className="w-full px-5 py-4 rounded-2xl border font-bold text-sm"
              autoCapitalize="none"
            />
            {/* Alerte Cooldown */}
            {isPseudoLockedByCooldown && (
              <View className="flex-row items-center mt-2 px-1">
                <Info size={12} color={colors.danger} />
                <Text style={{ color: colors.danger }} className="text-[10px] ml-1 font-bold italic">
                  Disponible dans {cooldown.remainingDays} jours.
                </Text>
              </View>
            )}
          </View>

          {/* Formulaire - Email */}
          <View className="mb-10">
            <Text style={{ color: colors.muted }} className="text-[10px] font-black uppercase tracking-[2px] mb-2 ml-1">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }}
              className="w-full px-5 py-4 rounded-2xl border font-bold text-sm"
            />
          </View>

          {/* Bouton de sauvegarde : Grisé si pas de changement ou erreur */}
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
              {hasChanged ? "Mettre à jour" : "Aucun changement"}
            </Text>
          </TouchableOpacity>

          {/* Note de sécurité */}
          <View 
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            className="mt-8 p-6 rounded-[32px] border border-dashed"
          >
             <Text style={{ color: colors.muted }} className="text-[10px] text-center leading-4">
              La modification du pseudonyme impacte votre identité sur <Text style={{ color: colors.text }} className="font-bold">RadioMonoco</Text>.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}