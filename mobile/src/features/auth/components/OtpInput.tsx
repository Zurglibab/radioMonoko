import React, { useRef } from "react";
import { View, TextInput } from "react-native";
import { theme } from "@/constants/theme";

/**
 * OtpInput : Composant de saisie de code à 6 chiffres.
 * Gère automatiquement le passage au champ suivant lors de la saisie.
 * * @param code : Tableau des 6 caractères actuels.
 * @param setCode : Fonction de mise à jour de l'état parent.
 */
export const OtpInput = ({ code, setCode }: { code: string[], setCode: (c: string[]) => void }) => {
  // Tableau de références pour accéder directement aux instances des TextInput
  // Utile pour déclencher la méthode .focus() manuellement.
  const inputs = useRef<TextInput[]>([]);

  /**
   * Gère la saisie d'un chiffre et le saut automatique.
   */
  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    // Je ne garde que le dernier caractère saisi pour éviter les problèmes de collage ou de saisie rapide de texte
    newCode[index] = text.slice(-1);
    setCode(newCode);

    // Auto-focus, variable qui vérifie si on vient de saisir un chiffre et que ce n'est pas le dernier champ pour passer au suivant
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  return (
    <View className="flex-row justify-between mb-8">
      {code.map((digit, i) => (
        <TextInput
          key={i}
          // J'enregistre la référence de chaque input dans notre tableau 'inputs'
          ref={(ref) => {
            if (ref) inputs.current[i] = ref;
          }}
          className="w-12 h-14 border rounded-xl text-center text-white text-xl font-bold"
          style={{ 
            backgroundColor: theme.dark.colors.surface, 
            borderColor: theme.dark.colors.border 
          }}
          maxLength={1} // Limite la saisie à un seul caractère par case
          keyboardType="number-pad" // Affiche le clavier numérique sur mobile
          onChangeText={(text) => handleChange(text, i)}
          value={digit}
          // Désactive les aides à la saisie qui pourraient gêner l'entrée d'un code OTP
          autoComplete="one-time-code" // Permet l'auto-remplissage via SMS sur iOS/Android
          selectTextOnFocus // Sélectionne le texte existant au clic pour faciliter le remplacement
        />
      ))}
    </View>
  );
};