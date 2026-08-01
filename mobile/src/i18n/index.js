// UI-chrome localization (buttons, labels, screen titles) — NOT the 366-day
// content banks (verses, moments, encouragements, wisdom, stories), which
// are a much larger, separate translation effort left for later. This
// covers the app shell (App.js) and the onboarding screen as a proof of
// concept; other screens still use hardcoded English strings and can follow
// the same t("namespace.key") pattern when translated.
//
// Falls back to the device's language via expo-localization when a
// translation exists, otherwise falls back to English.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import es from "./locales/es.json";

const SUPPORTED_LANGUAGES = ["en", "es"];

function detectDeviceLanguage() {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(code) ? code : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
