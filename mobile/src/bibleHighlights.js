// Per-verse highlight (one of 4 colors) and underline marks for the Bible
// chapter reader — a personal-study feature independent of the app's main
// journal data. Stored as one flat map keyed by "Book|chapter|verse" so a
// verse can be found in O(1) regardless of which screen looked it up.
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "barnabas.bibleHighlights.v1";

export const HIGHLIGHT_COLORS = ["green", "yellow", "red", "blue"];

// Swatch button colors (solid, for the picker UI) vs. the softer
// translucent overlay actually painted behind highlighted verse text —
// translucent reads correctly over both light and dark verse text instead
// of needing a separate palette per theme.
export const HIGHLIGHT_SWATCH_COLORS = {
  green: "#6FCF7C",
  yellow: "#FFD93D",
  red: "#FF6B6B",
  blue: "#5DADE2",
};
export const HIGHLIGHT_OVERLAY_COLORS = {
  green: "rgba(76, 175, 80, 0.35)",
  yellow: "rgba(255, 214, 0, 0.4)",
  red: "rgba(244, 67, 54, 0.3)",
  blue: "rgba(66, 165, 245, 0.32)",
};

function keyFor(book, chapter, verse) {
  return `${book}|${chapter}|${verse}`;
}

// Serializes every write onto one promise chain so rapid taps (switching
// colors quickly) can't race and leave a stale map persisted.
let queue = Promise.resolve();
function withQueue(fn) {
  const next = queue.catch(() => {}).then(fn);
  queue = next;
  return next;
}

export async function loadBibleHighlights() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function persist(map) {
  return withQueue(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map)).catch(() => {}));
}

export function getVerseMark(map, book, chapter, verse) {
  return map[keyFor(book, chapter, verse)] || null;
}

// Returns the new map (caller should setState with it). Tapping the
// verse's already-active color removes the highlight; tapping a different
// color replaces it. Underline (if set) is independent and untouched.
export function setVerseHighlightColor(map, book, chapter, verse, color) {
  const key = keyFor(book, chapter, verse);
  const existing = map[key];
  const next = { ...map };
  if (existing && existing.color === color) {
    if (existing.underline) next[key] = { underline: true };
    else delete next[key];
  } else {
    next[key] = { ...(existing || {}), color };
  }
  persist(next);
  return next;
}

export function toggleVerseUnderline(map, book, chapter, verse) {
  const key = keyFor(book, chapter, verse);
  const existing = map[key];
  const underline = !(existing && existing.underline);
  const next = { ...map };
  if (!underline && !(existing && existing.color)) {
    delete next[key];
  } else {
    next[key] = { ...(existing || {}), underline };
  }
  persist(next);
  return next;
}
