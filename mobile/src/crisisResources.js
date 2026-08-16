// Region-aware crisis resource text — used by the Today screen's crisis
// nudge card and the "Talk to Barnabas" chatbot (both the client-side
// disclaimer and, via the region code sent to the Worker, the system
// prompt Claude answers from). Region comes from the device's system
// locale (expo-localization), not GPS — no location permission needed,
// and it's the same signal src/i18n/index.js already reads for language
// detection.
//
// Numbers verified against each organization's own site/official source
// as of 2026-08; if any of these ever go stale, check the source before
// editing — this is safety-critical text.
import * as Localization from "expo-localization";

export const CRISIS_RESOURCES = {
  US: {
    sentence:
      "If you're in the US, the 988 Suicide & Crisis Lifeline is free and confidential, day or night — call or text 988. You can also text HOME to 741741 to reach the Crisis Text Line.",
    callLabel: "Call 988",
    callUrl: "tel:988",
  },
  CA: {
    sentence:
      "If you're in Canada, call or text 988 to reach the Suicide Crisis Helpline, free and confidential, day or night. In Quebec, you can also call 1-866-APPELLE (1-866-277-3553).",
    callLabel: "Call 988",
    callUrl: "tel:988",
  },
  GB: {
    sentence:
      "If you're in the UK, Samaritans are free to call anytime at 116 123, or text SHOUT to 85258 to reach the Shout Crisis Text Line.",
    callLabel: "Call 116 123",
    callUrl: "tel:116123",
  },
  IE: {
    sentence:
      "If you're in Ireland, Samaritans are free to call anytime at 116 123, or you can call Pieta's 24-hour helpline at 1800 247 247, or text HELP to 51444.",
    callLabel: "Call 116 123",
    callUrl: "tel:116123",
  },
  AU: {
    sentence: "If you're in Australia, Lifeline is free to call anytime at 13 11 14, or you can text 0477 13 11 14.",
    callLabel: "Call 13 11 14",
    callUrl: "tel:131114",
  },
  ES: {
    sentence:
      "Si estás en España, la línea 024 de atención a la conducta suicida es gratuita, confidencial y está disponible las 24 horas — llama al 024.",
    callLabel: "Llamar al 024",
    callUrl: "tel:024",
  },
  MX: {
    sentence:
      "Si estás en México, la Línea de la Vida está disponible las 24 horas, los 365 días del año — llama al 800 911 2000.",
    callLabel: "Llamar a la Línea de la Vida",
    callUrl: "tel:8009112000",
  },
};

export const DEFAULT_CRISIS_RESOURCE = {
  sentence:
    "Searching \"crisis line\" together with your country's name will help you find a local number — please reach out to real, trained help.",
  callLabel: null,
  callUrl: null,
};

export function getDeviceRegionCode() {
  return Localization.getLocales()[0]?.regionCode || null;
}

export function getCrisisResource(regionCode) {
  return (regionCode && CRISIS_RESOURCES[regionCode]) || DEFAULT_CRISIS_RESOURCE;
}
