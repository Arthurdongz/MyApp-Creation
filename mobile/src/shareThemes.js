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
];

export function shareThemeColors(shareTheme) {
  const found = SHARE_THEMES.find((t) => t.id === shareTheme);
  return (found || SHARE_THEMES[0]).colors;
}
