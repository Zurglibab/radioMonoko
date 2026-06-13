import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@radiomonoco_onboarding_seen";

// Force l'affichage de l'onboarding à chaque relance, en ignorant le stockage
const IS_DEV_MODE = true;

export const getOnboardingSeen = async (): Promise<boolean> => {
  if (IS_DEV_MODE) return false;


  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    // AsyncStorage stocke uniquement des strings, on transforme donc en booléen
    return value === "true";
  } catch {
    // En cas d'erreur technique, je préfère remontrer l'onboarding plutôt que de bloquer l'utilisateur ou de faire des suppositions erronées
    return false;
  }
};

export const setOnboardingSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
  } catch {}
};