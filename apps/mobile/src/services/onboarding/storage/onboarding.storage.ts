import AsyncStorage from "@react-native-async-storage/async-storage";

// Clé unique pour identifier l'état de l'onboarding dans le stockage local du téléphone
const ONBOARDING_KEY = "@radiomonoco_onboarding_seen";

/**
 * Flag de contrôle pour le développement.
 * @true : Force l'affichage de l'onboarding à chaque relance (ignore le stockage).
 * @false : Comportement de production (mémorise si l'utilisateur l'a déjà vu).
 */
const IS_DEV_MODE = true; 

/**
 * Vérifie si l'utilisateur a déjà complété l'onboarding.
 * @returns {Promise<boolean>}
 */
export const getOnboardingSeen = async (): Promise<boolean> => {
  // En mode développement, je force l'affichage de l'onboarding pour faciliter les tests
  if (IS_DEV_MODE) return false; 
  
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    // AsyncStorage stocke uniquement des strings, on transforme donc en booléen
    return value === "true";
  } catch (error) {
    // En cas d'erreur technique, je préfère remontrer l'onboarding plutôt que de bloquer l'utilisateur ou de faire des suppositions erronées
    console.error("Erreur lors de la lecture de l'état onboarding :", error);
    return false;
  }
};

/**
 * Enregistre le passage de l'utilisateur sur l'onboarding.
 */
export const setOnboardingSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'état onboarding :", error);
  }
};