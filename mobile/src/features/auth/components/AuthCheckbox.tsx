import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { theme } from "@/constants/theme";

interface Props {
  label: string; // Texte précédant le lien cliquable
  value: boolean; // État coché ou non
  onValueChange: (value: boolean) => void; // Fonction de retour pour mettre à jour l'état parent
}

/**
 * AuthCheckbox : Composant de formulaire personnalisé.
 * Utilisé principalement pour l'acceptation des CGU/Politique de confidentialité.
 * Construit manuellement pour s'intégrer parfaitement au design system RadioMonoko.
 */
export const AuthCheckbox = ({ label, value, onValueChange }: Props) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      // Inverse la valeur actuelle au clic
      onPress={() => onValueChange(!value)}
      className="flex-row items-center mb-6"
    >
      {/* Conteneur de la case à cocher */}
      <View
        className="w-5 h-5 rounded border items-center justify-center mr-3"
        style={{
          // Changement dynamique de la bordure et du fond selon l'état de la valeur
          borderColor: value ? theme.dark.colors.primary : theme.dark.colors.border,
          backgroundColor: value ? theme.dark.colors.primary : "transparent"
        }}
      >
        {/* L'icône Check n'est rendue que si la valeur est vraie */}
        {value && (
          <Check
            size={14}
            color={theme.dark.colors.secondary}
            strokeWidth={4}
          />
        )}
      </View>

      {/* Libellé avec gestion de styles distincts pour le texte normal et le lien */}
      <Text style={{ color: theme.dark.colors.muted }} className="text-sm">
        {label} {''}
        <Text
          style={{ color: theme.dark.colors.text }}
          className="font-bold underline"
        >
          {t('auth.authCheckbox.termsLink')}
        </Text>
      </Text>
    </TouchableOpacity>
  );
};