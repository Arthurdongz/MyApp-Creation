// UI-chrome localization (buttons, labels, screen titles) for English,
// Spanish, Portuguese, and French, plus language-aware selection of the
// 366-day content banks (verses, moments, encouragements, wisdom, stories)
// done separately at the point of use (see TodayScreen.js, FactScreen.js,
// StoryScreen.js).
//
// Falls back to the device's language via expo-localization when a
// translation exists, otherwise falls back to English.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";

const SUPPORTED_LANGUAGES = ["en", "es", "pt", "fr"];

function detectDeviceLanguage() {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    fr: { translation: fr },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
