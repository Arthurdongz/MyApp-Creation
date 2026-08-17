// Region-aware crisis resource text — used by the Today screen's crisis
// nudge card and the "Talk to Barnabas" chatbot (both the client-side
// disclaimer and, via the region code sent to the Worker, the system
// prompt Claude answers from). Region comes from the device's system
// locale (expo-localization), not GPS — no location permission needed,
// and it's the same signal src/i18n/index.js already reads for language
// detection.
//
// Device locale is only ever a guess, though — plenty of phones (common
// outside the US) report "en-US" as the locale/region regardless of the
// owner's actual country, since region often just follows a language
// preference nobody ever changed from the factory default. settings.
// crisisRegionOverride (see SettingsScreen's "Crisis Support Region"
// picker) lets a user correct that guess by hand — see
// resolveCrisisRegion, which is what every call site should actually use
// instead of calling getDeviceRegionCode() directly.
//
// Numbers verified against each organization's own site/official source
// as of 2026-08; if any of these ever go stale, check the source before
// editing — this is safety-critical text.
import * as Localization from "expo-localization";

// Sentinel for "I looked, my country isn't in this list" — deliberately
// not a real region code, so it always misses CRISIS_RESOURCES and falls
// through to DEFAULT_CRISIS_RESOURCE, same as any other unmatched code.
export const OTHER_REGION = "OTHER";

export const CRISIS_REGION_LABELS = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  IE: "Ireland",
  AU: "Australia",
  ES: "España (Spain)",
  MX: "México (Mexico)",
  ZW: "Zimbabwe",
  ZA: "South Africa",
  KE: "Kenya",
};

export const CRISIS_RESOURCES = {
  US: {
    sentence:
      "The 988 Suicide & Crisis Lifeline is free and confidential, day or night — call or text 988. You can also text HOME to 741741 to reach the Crisis Text Line.",
    callLabel: "Call 988",
    callUrl: "tel:988",
  },
  CA: {
    sentence:
      "Call or text 988 to reach the Suicide Crisis Helpline, free and confidential, day or night — the Crisis Text Line (text HOME to 741741) also operates in Canada. In Quebec, you can also call 1-866-APPELLE (1-866-277-3553).",
    callLabel: "Call 988",
    callUrl: "tel:988",
  },
  GB: {
    sentence:
      "Samaritans are free to call anytime at 116 123, or text SHOUT to 85258 to reach the Shout Crisis Text Line.",
    callLabel: "Call 116 123",
    callUrl: "tel:116123",
  },
  IE: {
    sentence:
      "Samaritans are free to call anytime at 116 123, or you can call Pieta's 24-hour helpline at 1800 247 247, or text HELP to 51444.",
    callLabel: "Call 116 123",
    callUrl: "tel:116123",
  },
  AU: {
    sentence: "Lifeline is free to call anytime at 13 11 14, or you can text 0477 13 11 14.",
    callLabel: "Call 13 11 14",
    callUrl: "tel:131114",
  },
  ES: {
    sentence:
      "La línea 024 de atención a la conducta suicida es gratuita, confidencial y está disponible las 24 horas — llama al 024.",
    callLabel: "Llamar al 024",
    callUrl: "tel:024",
  },
  MX: {
    sentence:
      "La Línea de la Vida está disponible las 24 horas, los 365 días del año — llama al 800 911 2000.",
    callLabel: "Llamar a la Línea de la Vida",
    callUrl: "tel:8009112000",
  },
  ZW: {
    sentence:
      "Friendship Bench's National Mental Health and Suicide Prevention Helpline is free to call at 0808 4116, Monday–Friday 8am–5pm — WhatsApp and SMS are also available.",
    callLabel: "Call 0808 4116",
    callUrl: "tel:08084116",
  },
  ZA: {
    sentence:
      "SADAG's Suicide Crisis Helpline is toll-free and available 24/7 — call 0800 567 567 for free, confidential counselling.",
    callLabel: "Call 0800 567 567",
    callUrl: "tel:0800567567",
  },
  KE: {
    sentence:
      "Befrienders Kenya offers free, confidential support by phone, SMS, or WhatsApp at 0722 178 177, Monday–Friday 9am–5pm.",
    callLabel: "Call 0722 178 177",
    callUrl: "tel:0722178177",
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

// The region every call site should actually resolve against: a user's
// explicit Settings choice wins if they've made one, otherwise fall back
// to the (possibly wrong) device-locale guess.
export function resolveCrisisRegion(settings) {
  return settings?.crisisRegionOverride || getDeviceRegionCode();
}
