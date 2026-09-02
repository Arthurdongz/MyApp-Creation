// Resolves a confession's scripture `ref` string (e.g. "Romans 8:37",
// "Psalm 91:10-11", "1 John 5:1, 11-12", "Isaiah 43:25, Jeremiah 31:34")
// into the actual KJV verse text, and gives access to a full chapter for
// "read more" — the local KJV_TEXT bundle backing this is the only
// translation wired up here (see App.js AGENTS notes: confession references
// use plain KJV text, independent of the daily-verse translation setting).

import { BIBLE_BOOKS } from "./data/bible-books";
import KJV_TEXT from "./data/bible-kjv.json";

const BOOK_INDEX = new Map(BIBLE_BOOKS.map((name, i) => [name, i]));
const SORTED_BOOKS = [...BIBLE_BOOKS].sort((a, b) => b.length - a.length);

function matchBookPrefix(segment) {
  for (const name of SORTED_BOOKS) {
    if (segment.startsWith(name + " ")) {
      return { book: name, rest: segment.slice(name.length + 1).trim() };
    }
  }
  return null;
}

// Parses a ref string into a flat list of { book, chapter, verseStart,
// verseEnd } pieces, tracking book/chapter context across comma-separated
// segments. Returns null if any segment can't be resolved.
export function parseRef(ref) {
  const segments = ref.split(",").map((s) => s.trim()).filter(Boolean);
  const pieces = [];
  let book = null;
  let chapter = null;

  for (const seg of segments) {
    const bookMatch = matchBookPrefix(seg);
    if (bookMatch) {
      book = bookMatch.book;
      const m = bookMatch.rest.match(/^(\d+):(\d+)(?:-(\d+))?$/);
      if (!m) return null;
      chapter = parseInt(m[1], 10);
      pieces.push({ book, chapter, verseStart: parseInt(m[2], 10), verseEnd: m[3] ? parseInt(m[3], 10) : parseInt(m[2], 10) });
      continue;
    }
    const withChapter = seg.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (withChapter) {
      if (!book) return null;
      chapter = parseInt(withChapter[1], 10);
      pieces.push({ book, chapter, verseStart: parseInt(withChapter[2], 10), verseEnd: withChapter[3] ? parseInt(withChapter[3], 10) : parseInt(withChapter[2], 10) });
      continue;
    }
    const bareVerse = seg.match(/^(\d+)(?:-(\d+))?$/);
    if (bareVerse) {
      if (!book || chapter == null) return null;
      pieces.push({ book, chapter, verseStart: parseInt(bareVerse[1], 10), verseEnd: bareVerse[2] ? parseInt(bareVerse[2], 10) : parseInt(bareVerse[1], 10) });
      continue;
    }
    return null;
  }
  return pieces.length ? pieces : null;
}

function chapterVerses(book, chapter) {
  const bi = BOOK_INDEX.get(book);
  if (bi == null) return null;
  return KJV_TEXT[bi]?.[chapter - 1] || null;
}

// Returns [{ book, chapter, verseStart, verseEnd, text }] — one block per
// parsed piece, each with its verse range's text already joined — or null
// if the ref couldn't be resolved.
export function lookupRef(ref) {
  const pieces = parseRef(ref);
  if (!pieces) return null;
  const blocks = [];
  for (const p of pieces) {
    const verses = chapterVerses(p.book, p.chapter);
    if (!verses) return null;
    const parts = [];
    for (let v = p.verseStart; v <= p.verseEnd; v++) {
      const text = verses[v - 1];
      if (!text) return null;
      parts.push({ verse: v, text });
    }
    blocks.push({ book: p.book, chapter: p.chapter, verseStart: p.verseStart, verseEnd: p.verseEnd, verses: parts });
  }
  return blocks;
}

// Full chapter as [{ verse, text }], for the "read the full chapter" view.
export function getChapter(book, chapter) {
  const verses = chapterVerses(book, chapter);
  if (!verses) return null;
  return verses.map((text, i) => ({ verse: i + 1, text }));
}

export function chapterCount(book) {
  const bi = BOOK_INDEX.get(book);
  if (bi == null) return 0;
  return KJV_TEXT[bi].length;
}

// Version-aware equivalents of getChapter/chapterCount, for the full
// Bible reader/browser which (unlike confession/verse-of-the-day lookups
// above) can show any of the 8 translations, not just KJV — see
// bibleVersions.js for how the other 7 translations' text gets fetched
// and cached on-device.
export function getChapterFrom(text, book, chapter) {
  const bi = BOOK_INDEX.get(book);
  if (bi == null) return null;
  const verses = text[bi]?.[chapter - 1];
  if (!verses) return null;
  return verses.map((t, i) => ({ verse: i + 1, text: t }));
}

export function chapterCountFrom(text, book) {
  const bi = BOOK_INDEX.get(book);
  if (bi == null) return 0;
  return text[bi]?.length || 0;
}

export { BIBLE_BOOKS };
