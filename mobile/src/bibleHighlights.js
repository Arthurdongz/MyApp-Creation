// Per-verse study marks for the Bible chapter reader — a highlight color,
// an underline, a bookmark, and/or a free-text note — independent of the
// app's main journal data. Stored as one flat map keyed by
// "Book|chapter|verse" so a verse can be found in O(1) regardless of which
// screen looked it up. Every mutator here is bulk (accepts an array of
// verse numbers) so the reader can mark a whole selected range in one
// action instead of one verse at a time.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BIBLE_BOOKS } from "./data/bible-books";

const BOOK_ORDER = new Map(BIBLE_BOOKS.map((name, i) => [name, i]));

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
// colors quickly, marking several verses in a row) can't race and leave a
// stale map persisted.
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

// Shared core for every bulk mutator: runs `updater` against each verse's
// existing mark (or null) and either stores the result or, if nothing
// meaningful is left (no color, no underline, no note), removes the key
// entirely so the map doesn't accumulate empty entries.
function updateMarks(map, book, chapter, verseNumbers, updater) {
  const next = { ...map };
  for (const verse of verseNumbers) {
    const key = keyFor(book, chapter, verse);
    const updated = updater(next[key] || null);
    if (updated && (updated.color || updated.underline || updated.note || updated.bookmark)) {
      next[key] = updated;
    } else {
      delete next[key];
    }
  }
  persist(next);
  return next;
}

// Always sets/replaces the color (no more toggle-off-by-tapping-the-same-
// swatch — that's what the dedicated "clear" action is for now).
export function setVersesColor(map, book, chapter, verseNumbers, color) {
  return updateMarks(map, book, chapter, verseNumbers, (existing) => ({ ...(existing || {}), color }));
}

export function setVersesUnderline(map, book, chapter, verseNumbers, value) {
  return updateMarks(map, book, chapter, verseNumbers, (existing) => ({ ...(existing || {}), underline: value }));
}

// Removes color + underline but keeps any note — "clear the highlight",
// not "forget my note too".
export function clearVersesMarks(map, book, chapter, verseNumbers) {
  return updateMarks(map, book, chapter, verseNumbers, (existing) => (existing?.note ? { note: existing.note } : null));
}

export function setVersesNote(map, book, chapter, verseNumbers, noteText) {
  const trimmed = (noteText || "").trim();
  return updateMarks(map, book, chapter, verseNumbers, (existing) => {
    const base = existing || {};
    if (!trimmed) {
      const { note, ...rest } = base;
      return rest;
    }
    return { ...base, note: trimmed };
  });
}

export function setVersesBookmark(map, book, chapter, verseNumbers, value) {
  return updateMarks(map, book, chapter, verseNumbers, (existing) => {
    const base = existing || {};
    if (!value) {
      const { bookmark, ...rest } = base;
      return rest;
    }
    return { ...base, bookmark: true };
  });
}

// Flattens the map into a sorted list for the "My Highlights & Notes"
// browsing screen — canonical Bible book order, then chapter, then verse,
// so entries read the way a reader would expect a Bible-ordered list to.
export function getAllMarkedVerses(map) {
  const entries = Object.keys(map).map((key) => {
    const [book, chapter, verse] = key.split("|");
    return { book, chapter: parseInt(chapter, 10), verse: parseInt(verse, 10), ...map[key] };
  });
  entries.sort((a, b) => {
    const bookDiff = (BOOK_ORDER.get(a.book) ?? 0) - (BOOK_ORDER.get(b.book) ?? 0);
    if (bookDiff) return bookDiff;
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });
  return entries;
}
