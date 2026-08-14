// Background gradients offered for shared quote/verse/story images — each
// pulled straight from the app's own palette (sage, gold, sky, the card
// accent colors) so every option still feels like Barnabas Journal, rather
// than an arbitrary color picker. Kept in sync with the web app's
// SHARE_THEMES in app.js.

export const SHARE_THEMES = [
  { id: "classic", name: "Classic", colors: ["#f7dca3", "#6f9578"] },
  { id: "sage", name: "Sage", colors: ["#eef4ea", "#56705f"] },
  { id: "sky", name: "Sky", colors: ["#cfe3ec", "#7c9885"] },
  { id: "story", name: "Story", colors: ["#f7dca3", "#8fae97"] },
  { id: "warm", name: "Warm", colors: ["#fbe4d8", "#e0ab3c"] },
  // Variations on the app's own colors (card/accent tokens).
  { id: "calm", name: "Calm", colors: ["#eaf1f5", "#56705f"] },
  { id: "goldenHour", name: "Golden Hour", colors: ["#f7ece0", "#e0ab3c"] },
  { id: "meadow", name: "Meadow", colors: ["#f9f0d8", "#7c9885"] },
  { id: "blushSky", name: "Blush Sky", colors: ["#fbe4d8", "#8fb3c9"] },
  { id: "parchmentGold", name: "Parchment Gold", colors: ["#f4f0e6", "#8a5c0d"] },
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
