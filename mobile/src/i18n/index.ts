import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { fr } from "./locales/fr";
import { en } from "./locales/en";

export type SupportedLanguage = "fr" | "en";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["fr", "en"];
export const LANGUAGE_STORAGE_KEY = "language_settings";

/**
 * getDeviceLanguage : Détecte la langue de l'appareil au démarrage de l'app.
 * Sert de valeur initiale avant que la préférence persistée (SecureStore) ne soit lue.
 */
export const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  return deviceLocale === "fr" ? "fr" : "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: getDeviceLanguage(),
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
