// Background gradients offered for shared quote/verse/story images — each
// pulled straight from the app's own palette (sage, gold, sky, the card
// accent colors) so every option still feels like Barnabas Journal, rather
// than an arbitrary color picker. Kept in sync with the web app's
// SHARE_THEMES in app.js.

export const SHARE_THEMES = [
  { id: "classic", name: "Classic", colors: ["#f8e2ab", "#2d5f45"] },
  { id: "sage", name: "Sage", colors: ["#e3f0e6", "#2d5f45"] },
  { id: "sky", name: "Sky", colors: ["#c3dde6", "#4f8d6e"] },
  { id: "story", name: "Story", colors: ["#f8e2ab", "#6fbb92"] },
  { id: "warm", name: "Warm", colors: ["#fbdccb", "#e69138"] },
  // Variations on the app's own colors (card/accent tokens).
  { id: "calm", name: "Calm", colors: ["#e1eef5", "#2d5f45"] },
  { id: "goldenHour", name: "Golden Hour", colors: ["#f7e3cf", "#e69138"] },
  { id: "meadow", name: "Meadow", colors: ["#f9e7bd", "#4f8d6e"] },
  { id: "blushSky", name: "Blush Sky", colors: ["#fbdccb", "#5b9bb0"] },
  { id: "parchmentGold", name: "Parchment Gold", colors: ["#fbf1e0", "#8f5308"] },
  // New tones not used elsewhere in the app, chosen to match its muted, warm feel.
  { id: "lavender", name: "Lavender", colors: ["#ece3f5", "#8a7ca8"] },
  { id: "rose", name: "Rose", colors: ["#fbe3e8", "#c98a9a"] },
  { id: "seafoam", name: "Seafoam", colors: ["#e0f2ec", "#5fa88f"] },
  { id: "sand", name: "Sand", colors: ["#f3e9d8", "#b08b5a"] },
  { id: "slate", name: "Slate", colors: ["#e6ecef", "#5f7885"] },
];

export function shareThemeColors(shareTheme) {
  const found = SHARE_THEMES.find((t) => t.id === shareTheme);
  return (found || SHARE_THEMES[0]).colors;
}
