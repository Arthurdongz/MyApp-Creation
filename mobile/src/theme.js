import { createContext, useContext } from "react";

// "Dawn Grove" palette — a richer, more saturated evolution of the app's
// original muted sage-and-cream look, not a departure from it: deeper
// forest green instead of washed-out sage, warmer marigold gold instead of
// mustard, and a cooler teal-blue for contrast. Chosen to still feel like a
// devotional/journaling app (warm, calm, trustworthy) rather than a loud or
// corporate one, while reading as distinctly its own rather than
// interchangeable with the sage-green-and-cream look shared by countless
// wellness/journaling apps. Every text/background pairing below has been
// checked against WCAG AA (4.5:1 for normal text) — see palette-contrast
// notes in the PR description if these ever need re-deriving.
export const lightColors = {
  bg: "#fbf1e0",
  card: "#fffdf7",
  sage: "#4f8d6e",
  sageDark: "#2d5f45",
  sky: "#5b9bb0",
  gold: "#e69138",
  goldText: "#8f5308",
  text: "#33302a",
  textSoft: "#6e6a5f",
  border: "#eaddc4",
  verseCard: "#e3f0e6",
  momentCard: "#e1eef5",
  storyCard: "#f7e3cf",
  reachOutCard: "#fbdccb",
  factCard: "#f9e7bd",
  input: "#fffdf9",
  // Solid-fill button background + the text color that sits on top of it —
  // plain colors.sage fails WCAG AA contrast against white text, so buttons
  // use dedicated, checked tokens instead of reusing the decorative
  // sage/border color.
  buttonBg: "#2d5f45",
  buttonOnText: "#ffffff",
  // A cool, slightly desaturated tint distinct from the warm cream `bg` used
  // everywhere else — gives the chat screen its own identity as a dedicated
  // messaging surface rather than another card floating on the app's usual
  // background.
  chatBg: "#e5eef0",
  chatHeaderBg: "#fbfdfc",
};

export const darkColors = {
  bg: "#161d18",
  card: "#212922",
  sage: "#6fbb92",
  sageDark: "#9fdcb8",
  sky: "#6fb8d1",
  gold: "#f0b84f",
  goldText: "#f0b84f",
  text: "#f0ece0",
  textSoft: "#aba795",
  border: "#3d4a3f",
  verseCard: "#1f2f25",
  momentCard: "#1c2c33",
  storyCard: "#332920",
  reachOutCard: "#3a2620",
  factCard: "#332a18",
  input: "#1a2119",
  buttonBg: "#6fbb92",
  buttonOnText: "#12241a",
  chatBg: "#11171a",
  chatHeaderBg: "#1a2226",
};

export function shadowFor(mode) {
  return {
    shadowColor: mode === "dark" ? "#000000" : "#5a6450",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: mode === "dark" ? 0.5 : 0.08,
    shadowRadius: 12,
    elevation: 2,
  };
}

const ThemeContext = createContext({
  mode: "light",
  colors: lightColors,
  shadow: shadowFor("light"),
  toggleTheme: () => {},
});

export function ThemeProvider({ mode, toggleTheme, children }) {
  const colors = mode === "dark" ? darkColors : lightColors;
  const value = { mode, colors, shadow: shadowFor(mode), toggleTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
