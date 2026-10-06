// The twelve classic principles of biblical hermeneutics (how Scripture is
// meant to be read and interpreted) — the same list taught in sound Bible
// study, here so the app can point out, passage by passage, which
// principle is actually at work and why it matters. Title/description text
// lives in i18n (interpretationPrinciples.<id>.title/.description), not
// here, matching the pattern every other content bank in this app uses for
// translatable UI copy — this file only holds the stable id order and the
// icon each principle renders with.
//
// Where this shows up in the app: CROSS_REFERENCE_PLAN days (see
// crossReferenceReadingPlan.js) each carry one or more of these ids in a
// `principles` array, plus a `principleNote` key in i18n explaining how
// that specific day's passages demonstrate it — surfaced via a small
// "Did you know?" icon in the expanded day view (BibleReadingPlansScreen).
export const INTERPRETATION_PRINCIPLE_ORDER = [
  "literal",
  "firstMention",
  "context",
  "historical",
  "grammatical",
  "scriptureInterprets",
  "progressiveRevelation",
  "harmonization",
  "doubleReference",
  "moral",
  "typology",
  "christological",
];

export const INTERPRETATION_PRINCIPLES = {
  literal: { id: "literal", icon: "document-text-outline" },
  firstMention: { id: "firstMention", icon: "flag-outline" },
  context: { id: "context", icon: "layers-outline" },
  historical: { id: "historical", icon: "time-outline" },
  grammatical: { id: "grammatical", icon: "language-outline" },
  scriptureInterprets: { id: "scriptureInterprets", icon: "swap-horizontal-outline" },
  progressiveRevelation: { id: "progressiveRevelation", icon: "trending-up-outline" },
  harmonization: { id: "harmonization", icon: "git-merge-outline" },
  doubleReference: { id: "doubleReference", icon: "copy-outline" },
  moral: { id: "moral", icon: "compass-outline" },
  typology: { id: "typology", icon: "shapes-outline" },
  christological: { id: "christological", icon: "sunny-outline" },
};
