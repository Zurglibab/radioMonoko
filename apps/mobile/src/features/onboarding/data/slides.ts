import { ImageSourcePropType } from "react-native";

/**
 * Interface OnboardingSlideModel
 * Définit la structure stricte pour chaque diapositive de l'onboarding.
 * L'utilisation d'une interface assure la cohérence des données passées aux composants.
 */
export interface OnboardingSlideModel {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

/**
 * Liste des diapositives de l'onboarding.
  * Chaque objet respecte la structure définie par OnboardingSlideModel.
  * Les images sont importées localement via require pour garantir un chargement rapide au démarrage de l'application.
 */
export const ONBOARDING_SLIDES: OnboardingSlideModel[] = [
  {
    id: "1",
    title: "L'ONDE SOCIALE.",
    description: "Explorez des milliers de stations et podcasts. Archivez ce qui fait vibrer vos tympans au quotidien.",
    image: require("@/assets/images/onboarding/onboarding-radio-1.jpg"),
  },
  {
    id: "2",
    title: "VOTRE VERDICT.",
    description: "Notez les émissions, partagez vos critiques et découvrez ce que la communauté écoute en boucle.",
    image: require("@/assets/images/onboarding/onboarding-radio-2.jpg"),
  },
  {
    id: "3",
    title: "EN DIRECT ENSEMBLE.",
    description: "Suivez vos curateurs préférés, échangez en temps réel et ne manquez jamais un live important.",
    image: require("@/assets/images/onboarding/onboarding-radio-3.jpg"),
  },
];