import { ImageSourcePropType } from "react-native";
import { Asset } from "expo-asset";

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

// On définit l'image du welcome ici pour pouvoir la précharger de façon centralisée
export const WELCOME_IMAGE = require("@/assets/images/welcome.jpg");

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

/**
 * Prépare les assets en cache (Onboarding + Welcome) pour éviter le lag au premier affichage.
 */
export const preloadAppAssets = async () => {
  const imagesToCache = [
    ...ONBOARDING_SLIDES.map((slide) => slide.image),
    WELCOME_IMAGE,
  ];
  const cacheImages = imagesToCache.map((image) => {
    return Asset.fromModule(image).downloadAsync();
  });
  return Promise.all(cacheImages);
};