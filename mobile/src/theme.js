import { createContext, useContext } from "react";

export const lightColors = {
  bg: "#f4f0e6",
  card: "#fffdf8",
  sage: "#7c9885",
  sageDark: "#56705f",
  sky: "#8fb3c9",
  gold: "#e0ab3c",
  text: "#3a3a34",
  textSoft: "#71716a",
  border: "#e7e1d3",
  verseCard: "#eef4ea",
  momentCard: "#eaf1f5",
  input: "#fffefc",
};

export const darkColors = {
  bg: "#1b201c",
  card: "#252b25",
  sage: "#8fae97",
  sageDark: "#b7cfbd",
  sky: "#9fc4dc",
  gold: "#e8bd5a",
  text: "#e8e5d9",
  textSoft: "#a3a296",
  border: "#3a4139",
  verseCard: "#24312a",
  momentCard: "#212d33",
  input: "#1f241f",
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
