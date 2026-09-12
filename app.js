// Barnabas Journal — app logic. Pure client-side, persisted to localStorage.
//
// Content is organized around a per-user "journey day" number (1..366),
// not the calendar day-of-year: each user gets their own shuffled order of
// the 366 content slots on first use, and a new day unlocks once per real
// calendar day since then. Users can navigate back through days they've
// already reached, but not ahead of the current unlocked day.

const STORAGE_KEY = "barnabasJournalStateV2";

// The "Encouraging Thought" card is quotes-only now (true stories moved to
// their own Story tab, backed by data-stories.js). WISDOM itself still holds
// legacy "story"-type entries alongside quotes; filter down to just quotes.
const QUOTES = WISDOM.filter((w) => w.type === "quote");

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);

// Resolves a confession's scripture `ref` string into actual KJV verse
// text, backed by the bundled full-Bible data (data-bible-books.js +
// data-bible-kjv.js) — see bibleLookup.js in the mobile app for the
// original version of this parser; kept in sync by hand since this file
// has no module system to share it through.
const BIBLE_BOOK_INDEX = new Map(BIBLE_BOOKS.map((name, i) => [name, i]));
const SORTED_BIBLE_BOOKS = [...BIBLE_BOOKS].sort((a, b) => b.length - a.length);

function matchBookPrefix(segment) {
  for (const name of SORTED_BIBLE_BOOKS) {
    if (segment.startsWith(name + " ")) {
      return { book: name, rest: segment.slice(name.length + 1).trim() };
    }
  }
  return null;
}

function parseScriptureRef(ref) {
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
  const bi = BIBLE_BOOK_INDEX.get(book);
  if (bi == null) return null;
  return KJV_TEXT[bi]?.[chapter - 1] || null;
}

function lookupScriptureRef(ref) {
  const pieces = parseScriptureRef(ref);
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

function getBibleChapter(book, chapter) {
  const verses = chapterVerses(book, chapter);
  if (!verses) return null;
  return verses.map((text, i) => ({ verse: i + 1, text }));
}

function bibleChapterCount(book) {
  const bi = BIBLE_BOOK_INDEX.get(book);
  if (bi == null) return 0;
  return KJV_TEXT[bi].length;
}

// --- Full-Bible chapter reader: multi-version download & cache ---------
// Only KJV ships bundled with the app (~4MB). The other 7 translations'
// full text live as static JSON in this same repo's bible-data/ folder
// and are fetched on first use from raw.githubusercontent.com, then
// cached via the Cache Storage API — the same mechanism sw.js already
// uses for the app shell — so later reads work offline without
// re-downloading. chapterVerses/getBibleChapter/bibleChapterCount above
// stay KJV-only on purpose (VersePopup's confession/verse lookups are
// always KJV); the "*From"/"*Versioned" helpers below take an explicit
// text array so the chapter reader and Bible browser can read any
// downloaded version.
const BIBLE_DATA_BASE_URL =
  "https://raw.githubusercontent.com/Arthurdongz/MyApp-Creation/claude/barnabas-journal-app-xxz25d/bible-data/";
const BIBLE_DATA_CACHE_NAME = "barnabas-bible-data-v1";
const bibleVersionTextCache = { KJV: KJV_TEXT };
const bibleVersionLoadPromises = {};

function isBibleVersionLoaded(id) {
  return !!bibleVersionTextCache[id];
}

async function loadBibleVersionText(id) {
  if (bibleVersionTextCache[id]) return bibleVersionTextCache[id];
  if (bibleVersionLoadPromises[id]) return bibleVersionLoadPromises[id];

  const url = `${BIBLE_DATA_BASE_URL}${id}.json`;
  const promise = (async () => {
    let response = null;
    if ("caches" in window) {
      try {
        const cache = await caches.open(BIBLE_DATA_CACHE_NAME);
        response = await cache.match(url);
      } catch (e) {
        // Cache Storage unavailable (private browsing, old browser) —
        // fall through to a plain network fetch below.
      }
    }
    if (!response) {
      const networkResponse = await fetch(url);
      if (!networkResponse.ok) throw new Error(`Failed to download ${id}`);
      if ("caches" in window) {
        try {
          const cache = await caches.open(BIBLE_DATA_CACHE_NAME);
          await cache.put(url, networkResponse.clone());
        } catch (e) {
          // Couldn't persist the cache entry — still usable this session.
        }
      }
      response = networkResponse;
    }
    const data = await response.json();
    bibleVersionTextCache[id] = data;
    return data;
  })();

  bibleVersionLoadPromises[id] = promise;
  try {
    return await promise;
  } finally {
    delete bibleVersionLoadPromises[id];
  }
}

function chapterVersesFrom(text, book, chapter) {
  const bi = BIBLE_BOOK_INDEX.get(book);
  if (bi == null) return null;
  return text[bi]?.[chapter - 1] || null;
}

function getBibleChapterFrom(text, book, chapter) {
  const verses = chapterVersesFrom(text, book, chapter);
  if (!verses) return null;
  return verses.map((t, i) => ({ verse: i + 1, text: t }));
}

function bibleChapterCountFrom(text, book) {
  const bi = BIBLE_BOOK_INDEX.get(book);
  if (bi == null) return 0;
  return text[bi]?.length || 0;
}

// Resolves a day's verse entry down to the actual translation text to show,
// based on the user's alternate/favorite setting.
function getVerseForDay(day) {
  const entry = pickForDay(VERSES, day, state.order);
  const version = pickVerseVersion(day, state.settings, VERSE_VERSION_IDS);
  return { ref: entry.ref, version, text: entry.versions[version] || entry.versions.KJV };
}

// Background gradients offered for shared quote/verse/story images — each
// pulled straight from the app's own palette (sage, gold, sky, the card
// accent colors) so every option still feels like Barnabas Journal, rather
// than an arbitrary color picker.
const SHARE_THEMES = [
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

function shareThemeColors() {
  const found = SHARE_THEMES.find((t) => t.id === state.settings.shareTheme);
  return (found || SHARE_THEMES[0]).colors;
}

const BADGE_DEFS = [
  { id: "seed", icon: "🌱", name: "Seed of Encouragement", desc: "Earn 10 stars", type: "stars", threshold: 10 },
  { id: "growing", icon: "🌿", name: "Growing in Grace", desc: "Earn 50 stars", type: "stars", threshold: 50 },
  { id: "heart", icon: "💛", name: "Barnabas Heart", desc: "Earn 100 stars", type: "stars", threshold: 100 },
  { id: "son", icon: "🕊️", name: "Son of Encouragement", desc: "Earn 250 stars", type: "stars", threshold: 250 },
  { id: "steady", icon: "🕯️", name: "Steady Companion", desc: "3-day streak", type: "streak", threshold: 3 },
  { id: "week", icon: "☀️", name: "Week of Hope", desc: "7-day streak", type: "streak", threshold: 7 },
  { id: "faithful", icon: "🌟", name: "Faithful Encourager", desc: "30-day streak", type: "streak", threshold: 30 },
];

function defaultSettings() {
  return {
    onboarded: false,
    theme: "system",
    shareTheme: "classic",
    speechVoiceURI: "",
    speechPitch: 1,
    speechRate: 0.95,
    lastCrisisNudgeShownAt: null,
    lastCheckInNudgeShownAt: null,
    verseVersionMode: "alternate",
    verseFavoriteVersion: "KJV",
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.journeyStartDate && Array.isArray(parsed.order)) {
        return {
          journeyStartDate: parsed.journeyStartDate,
          order: parsed.order,
          entries: parsed.entries || {},
          totalStars: parsed.totalStars || 0,
          favorites: parsed.favorites || [],
          settings: { ...defaultSettings(), ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      // fall through to a fresh journey
    }
  }
  return {
    journeyStartDate: todayDateKey(),
    order: shuffledOrder(TOTAL_DAYS),
    entries: {},
    totalStars: 0,
    favorites: [],
    settings: defaultSettings(),
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
saveState(state);

// The day currently unlocked for this user (advances once per real day).
function unlockedDay() {
  return unlockedDayFor(state.journeyStartDate);
}

// The day currently being viewed (may be any unlocked day, not just today's).
let viewingDay = unlockedDay();

// Whether the "write your own kindness" text box is currently open — purely
// a UI toggle, not persisted, reset whenever the viewed day changes.
let showCustomMomentInputUI = false;

// Whether the "let this sit for a moment" reflection box (under A Word for
// You) is currently open — same kind of purely-local UI toggle.
let showWordReflectInputUI = false;

// Whether the story insight ("i") panel is currently open — same kind of
// purely-local UI toggle, reset whenever the viewed day/story changes.
let showStoryInsightUI = false;

// The three "Reflect on Today" journal fields are shown as accordion rows.
// Each field's open/closed state defaults to whether the viewed day already
// has text in it (so a returning user sees their own words immediately),
// but the user can freely toggle any row after that — reset only when the
// viewed day itself changes.
function reflectRowsConfig() {
  return [
    { key: "heart", field: "reflection", rowId: "reflectHeartRow", inputId: "reflectionInput", previewId: "reflectHeartPreview" },
    { key: "barnabas", field: "barnabasNote", rowId: "reflectBarnabasRow", inputId: "barnabasInput", previewId: "reflectBarnabasPreview" },
    { key: "kindness", field: "receivedKindness", rowId: "reflectKindnessRow", inputId: "receivedKindnessInput", previewId: "reflectKindnessPreview" },
  ];
}

let reflectAccordionOpen = { heart: false, barnabas: false, kindness: false };

function initReflectAccordionForDay(entry) {
  reflectAccordionOpen = {
    heart: Boolean(entry.reflection),
    barnabas: Boolean(entry.barnabasNote),
    kindness: Boolean(entry.receivedKindness),
  };
}

function truncateForPreview(text) {
  const trimmed = text.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90).trimEnd()}…` : trimmed;
}

// Updates one accordion row's open/closed display and preview text.
// `syncInput` is false when called from a plain toggle click, so toggling
// one row never clobbers unsaved text a user is mid-typing in another row.
function syncAccordionRow(cfg, entry, syncInput) {
  const row = document.getElementById(cfg.rowId);
  const isOpen = reflectAccordionOpen[cfg.key];
  row.classList.toggle("open", isOpen);
  row.querySelector(".accordion-row-body").hidden = !isOpen;
  if (syncInput) document.getElementById(cfg.inputId).value = entry[cfg.field] || "";
  const preview = document.getElementById(cfg.previewId);
  if (!isOpen && entry[cfg.field]) {
    preview.textContent = truncateForPreview(entry[cfg.field]);
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
}

function ensureDayEntry(dayNumber) {
  const key = `day-${dayNumber}`;
  if (!state.entries[key]) {
    state.entries[key] = {
      dayNumber,
      dateLogged: dateKeyForDayNumber(state.journeyStartDate, dayNumber),
      mood: null,
      reflection: "",
      barnabasNote: "",
      receivedKindness: "",
      momentDone: false,
      momentIntention: null,
      customMoment: null,
      momentFollowUpAsked: false,
      momentFollowUpStatus: null,
      starsAwarded: { daily: false, moment: false, journal: false },
    };
  }
  const entry = state.entries[key];
  if (!entry.starsAwarded) entry.starsAwarded = { daily: false, moment: false, journal: false };
  return entry;
}

function awardStars(entry, field, amount) {
  if (entry.starsAwarded[field]) return;
  entry.starsAwarded[field] = true;
  state.totalStars += amount;
}

// At most one missed day per any rolling 7-day window can be "graced" — it
// bridges the streak without breaking it, but doesn't itself count toward
// the streak number. Tracked as a rolling lookback (the gap in day numbers
// since the last graced day), not a fixed calendar-week bucket — a fixed
// bucket anchored to day 1 let two adjacent missed days both get graced
// whenever they happened to straddle a bucket boundary (e.g. days 7 and 8),
// while the same two-day gap elsewhere (e.g. days 8 and 9) broke the streak
// entirely. A rolling window treats every two-day gap the same regardless
// of where the journey started.
function computeStreak() {
  let streak = 0;
  let lastGraceDay = null;
  let n = unlockedDay();
  while (n >= 1) {
    const entry = state.entries[`day-${n}`];
    const hasActivity = entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (hasActivity) {
      streak += 1;
      n -= 1;
      continue;
    }
    const graceAvailable = lastGraceDay === null || lastGraceDay - n >= 7;
    if (graceAvailable) {
      lastGraceDay = n;
      n -= 1;
      continue;
    }
    break;
  }
  return streak;
}

function countMomentsDone() {
  return Object.values(state.entries).filter((e) => e.momentDone).length;
}

// ---------- Favorites ----------

function favoriteId(type, dayNumber) {
  return `${type}-${dayNumber}`;
}

function isFavorited(type, dayNumber) {
  return state.favorites.some((f) => f.id === favoriteId(type, dayNumber));
}

function toggleFavorite(type, dayNumber, payload) {
  const id = favoriteId(type, dayNumber);
  const idx = state.favorites.findIndex((f) => f.id === id);
  if (idx >= 0) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push({ id, type, dayNumber, savedAt: todayDateKey(), ...payload });
  }
  saveState(state);
}

// ---------- Theme ----------

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function effectiveTheme() {
  if (state.settings.theme === "system") return systemPrefersDark() ? "dark" : "light";
  return state.settings.theme;
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", effectiveTheme());
  const btn = document.getElementById("settingsThemeToggle");
  if (btn) btn.textContent = effectiveTheme() === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  state.settings.theme = effectiveTheme() === "dark" ? "light" : "dark";
  saveState(state);
  applyTheme();
}

// ---------- Export / Import ----------

function exportData() {
  const payload = { app: "barnabas-journal", schema: 2, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `barnabas-journal-backup-${todayDateKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  state.settings.lastBackupAt = todayDateKey();
  saveState(state);
  renderLastBackupNote();
}

function renderLastBackupNote() {
  const el = document.getElementById("lastBackupNote");
  if (!el) return;
  const last = state.settings.lastBackupAt;
  if (!last) {
    el.textContent = "You haven't exported a backup yet — your journal only lives on this device.";
    return;
  }
  const daysAgo = daysBetweenKeys(last, todayDateKey());
  if (daysAgo >= 30) {
    el.textContent = `It's been ${daysAgo} days since your last backup (${formatDate(last)}) — consider exporting a fresh one.`;
  } else {
    el.textContent = `Last backup: ${formatDate(last)}.`;
  }
}

function showBackupMsg(text, isError) {
  const el = document.getElementById("backupMsg");
  el.textContent = text;
  el.classList.toggle("backup-msg-error", Boolean(isError));
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

function importDataFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const incoming = parsed.state || parsed;
      if (!incoming.journeyStartDate || !Array.isArray(incoming.order)) {
        throw new Error("Missing required fields");
      }
      state = {
        journeyStartDate: incoming.journeyStartDate,
        order: incoming.order,
        entries: incoming.entries || {},
        totalStars: incoming.totalStars || 0,
        favorites: incoming.favorites || [],
        settings: { ...defaultSettings(), ...(incoming.settings || {}), onboarded: true },
      };
      viewingDay = unlockedDay();
      saveState(state);
      applyTheme();
      initReflectAccordionForDay(ensureDayEntry(viewingDay));
      renderToday();
      renderStory();
      renderHistory();
      renderOnThisDay();
      renderRewards();
      renderMoodCalendar();
      renderFavorites();
      renderLastBackupNote();
      showBackupMsg("Backup restored. Welcome back!");
    } catch (e) {
      showBackupMsg("That file doesn't look like a valid Barnabas Journal backup.", true);
    }
  };
  reader.readAsText(file);
}

// ---------- Sharing ----------

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderQuoteCardCanvas(mainText, sourceLine, colors) {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const [colorStart, colorEnd] = colors || shareThemeColors();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#3a3a34";
  ctx.font = "56px Georgia, 'Iowan Old Style', serif";
  const maxWidth = W - 180;
  const lines = wrapCanvasText(ctx, `“${mainText}”`, maxWidth);
  const lineHeight = 74;
  const blockHeight = lines.length * lineHeight;
  const startY = H / 2 - blockHeight / 2 + lineHeight / 2 - 20;
  lines.forEach((line, i) => ctx.fillText(line, W / 2, startY + i * lineHeight));

  if (sourceLine) {
    ctx.font = "700 32px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "#3f5548";
    ctx.fillText(sourceLine, W / 2, startY + blockHeight + 46);
  }

  ctx.font = "700 30px Georgia, 'Iowan Old Style', serif";
  ctx.fillStyle = "rgba(58, 58, 52, 0.55)";
  ctx.fillText("✦ Barnabas Journal", W / 2, H - 64);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function shareOrDownloadImage(blob, filename, shareTitle, shareText) {
  try {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: shareTitle, text: shareText });
      return "shared";
    }
  } catch (e) {
    if (e && e.name === "AbortError") return "cancelled";
    // fall through to download
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}

async function shareText(text) {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return "shared";
    }
  } catch (e) {
    if (e && e.name === "AbortError") return "cancelled";
    // fall through to clipboard
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (e) {
    return "failed";
  }
}

// ---------- Share preview (color picker shown at share time) ----------

let sharePreview = null;

function renderSharePreviewImage() {
  const canvas = renderQuoteCardCanvas(sharePreview.mainText, sharePreview.sourceLine, sharePreview.colors);
  document.getElementById("sharePreviewImage").src = canvas.toDataURL("image/png");
}

function renderSharePreviewSwatches() {
  const container = document.getElementById("sharePreviewSwatches");
  container.innerHTML = SHARE_THEMES
    .map((t) => {
      const selected = sharePreview.colors[0] === t.colors[0] && sharePreview.colors[1] === t.colors[1];
      return `<button type="button" class="share-theme-swatch${selected ? " selected" : ""}" data-theme="${t.id}" title="${t.name}" aria-label="${t.name} background${selected ? ", selected" : ""}" style="background: linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})"></button>`;
    })
    .join("");
  container.querySelectorAll(".share-theme-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = SHARE_THEMES.find((t) => t.id === btn.dataset.theme);
      sharePreview.colors = theme.colors;
      state.settings.shareTheme = theme.id;
      saveState(state);
      renderSharePreviewSwatches();
      renderSharePreviewImage();
    });
  });
}

function openSharePreview(mainText, sourceLine, filenamePrefix, msgElId, day) {
  sharePreview = { mainText, sourceLine, filenamePrefix, msgElId, day, colors: shareThemeColors() };
  renderSharePreviewSwatches();
  renderSharePreviewImage();
  document.getElementById("sharePreviewMsg").hidden = true;
  document.getElementById("sharePreviewOverlay").hidden = false;
}

function closeSharePreview() {
  document.getElementById("sharePreviewOverlay").hidden = true;
}

async function confirmSharePreview() {
  if (!sharePreview) return;
  const { mainText, sourceLine, filenamePrefix, msgElId, day, colors } = sharePreview;
  const canvas = renderQuoteCardCanvas(mainText, sourceLine, colors);
  const blob = await canvasToBlob(canvas);
  const result = await shareOrDownloadImage(
    blob,
    `barnabas-journal-${filenamePrefix}-day${day}.png`,
    "Barnabas Journal",
    mainText
  );
  const msgEl = document.getElementById("sharePreviewMsg");
  if (result === "downloaded") {
    msgEl.textContent = "Image saved — share it from your downloads.";
    msgEl.hidden = false;
  } else if (result === "shared") {
    msgEl.textContent = "Shared. Thank you for passing it on!";
    msgEl.hidden = false;
  }
  showShareMsg(msgElId, result);
  setTimeout(closeSharePreview, 1200);
}

function setupSharePreview() {
  document.getElementById("sharePreviewCloseBtn").addEventListener("click", closeSharePreview);
  document.getElementById("sharePreviewShareBtn").addEventListener("click", confirmSharePreview);
  document.getElementById("sharePreviewOverlay").addEventListener("click", (e) => {
    if (e.target.id === "sharePreviewOverlay") closeSharePreview();
  });
}

// Verse popup (tap the verse-of-the-day or confession's reference) + Bible chapter reader
// ("Read the full chapter" inside the popup) — see VersePopup.js /
// BibleChapterModal.js in the mobile app for the equivalent components.
let bibleChapterState = null; // { book, chapter, targetChapter, highlightStart, highlightEnd, selectedVerses, menuOpen, noteEditorOpen, copiedFlash }

// Per-verse highlight (one of 4 colors), underline, and free-text note for
// the chapter reader — a personal-study feature independent of the app's
// main journal state. One flat map keyed by "Book|chapter|verse",
// synchronous localStorage (no race risk the way AsyncStorage has on
// mobile). Every mutator is bulk (accepts an array of verse numbers) so a
// whole selected range can be marked in one action.
const BIBLE_HIGHLIGHTS_KEY = "barnabas_bible_highlights_v1";
const HIGHLIGHT_COLORS = ["green", "yellow", "red", "blue"];
const HIGHLIGHT_SWATCH_COLORS = { green: "#6FCF7C", yellow: "#FFD93D", red: "#FF6B6B", blue: "#5DADE2" };
const HIGHLIGHT_OVERLAY_COLORS = {
  green: "rgba(76, 175, 80, 0.35)",
  yellow: "rgba(255, 214, 0, 0.4)",
  red: "rgba(244, 67, 54, 0.3)",
  blue: "rgba(66, 165, 245, 0.32)",
};

function loadBibleHighlights() {
  try {
    const raw = localStorage.getItem(BIBLE_HIGHLIGHTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function saveBibleHighlights(map) {
  try {
    localStorage.setItem(BIBLE_HIGHLIGHTS_KEY, JSON.stringify(map));
  } catch (e) {
    // storage unavailable/full — marks just won't persist this session
  }
}
let bibleHighlights = loadBibleHighlights();
function bibleMarkKey(book, chapter, verse) {
  return `${book}|${chapter}|${verse}`;
}
function getBibleVerseMark(book, chapter, verse) {
  return bibleHighlights[bibleMarkKey(book, chapter, verse)] || null;
}
// Shared core for every bulk mutator below: runs `updater` against each
// verse's existing mark (or null) and either stores the result or, if
// nothing meaningful is left (no color, no underline, no note), removes
// the key entirely so the map doesn't accumulate empty entries.
function updateBibleMarks(book, chapter, verseNumbers, updater) {
  for (const verse of verseNumbers) {
    const key = bibleMarkKey(book, chapter, verse);
    const updated = updater(bibleHighlights[key] || null);
    if (updated && (updated.color || updated.underline || updated.note)) {
      bibleHighlights[key] = updated;
    } else {
      delete bibleHighlights[key];
    }
  }
  saveBibleHighlights(bibleHighlights);
}
function setBibleVersesColor(book, chapter, verseNumbers, color) {
  updateBibleMarks(book, chapter, verseNumbers, (existing) => ({ ...(existing || {}), color }));
}
function setBibleVersesUnderline(book, chapter, verseNumbers, value) {
  updateBibleMarks(book, chapter, verseNumbers, (existing) => ({ ...(existing || {}), underline: value }));
}
function clearBibleVersesMarks(book, chapter, verseNumbers) {
  updateBibleMarks(book, chapter, verseNumbers, (existing) => (existing && existing.note ? { note: existing.note } : null));
}
function setBibleVersesNote(book, chapter, verseNumbers, noteText) {
  const trimmed = (noteText || "").trim();
  updateBibleMarks(book, chapter, verseNumbers, (existing) => {
    const base = existing || {};
    if (!trimmed) {
      const { note, ...rest } = base;
      return rest;
    }
    return { ...base, note: trimmed };
  });
}

// Groups a sorted list of verse numbers into range strings — [3,4,5,8] ->
// "3-5,8" — matching the same comma/range convention already used for
// scripture refs elsewhere in the app (e.g. "Psalm 13:1,5").
function formatBibleVerseRanges(sortedNums) {
  const parts = [];
  let start = sortedNums[0];
  let prev = sortedNums[0];
  for (let i = 1; i <= sortedNums.length; i++) {
    const n = sortedNums[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = n;
    prev = n;
  }
  return parts.join(",");
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fall through to the legacy fallback below
  }
  try {
    const node = document.createElement("textarea");
    node.value = text;
    node.style.position = "fixed";
    node.style.opacity = "0";
    document.body.appendChild(node);
    node.focus();
    node.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(node);
    return ok;
  } catch (e) {
    return false;
  }
}

function openVersePopup(ref) {
  const blocks = lookupScriptureRef(ref);
  document.getElementById("versePopupTitle").textContent = ref;
  const body = document.getElementById("versePopupBody");
  body.innerHTML = "";
  if (!blocks) {
    const p = document.createElement("p");
    p.className = "verse-popup-text";
    p.textContent = "This verse isn't available to read here yet.";
    body.appendChild(p);
  } else {
    blocks.forEach((block) => {
      const wrap = document.createElement("div");
      wrap.className = "verse-popup-block";

      const textEl = document.createElement("p");
      textEl.className = "verse-popup-text";
      textEl.textContent = block.verses
        .map((v) => (block.verses.length > 1 ? `${v.verse} ${v.text}` : v.text))
        .join(" ");
      wrap.appendChild(textEl);

      const footer = document.createElement("div");
      footer.className = "verse-popup-footer";
      const refEl = document.createElement("p");
      refEl.className = "verse-popup-ref";
      const rangeLabel = block.verseStart === block.verseEnd ? `${block.verseStart}` : `${block.verseStart}-${block.verseEnd}`;
      refEl.textContent = `${block.book} ${block.chapter}:${rangeLabel} (KJV)`;
      footer.appendChild(refEl);

      const moreBtn = document.createElement("button");
      moreBtn.type = "button";
      moreBtn.className = "verse-popup-more";
      moreBtn.textContent = "Read the full chapter →";
      moreBtn.addEventListener("click", () => openBibleChapter(block.book, block.chapter, block.verseStart, block.verseEnd));
      footer.appendChild(moreBtn);

      wrap.appendChild(footer);
      body.appendChild(wrap);
    });
  }
  document.getElementById("versePopupOverlay").hidden = false;
}

function closeVersePopup() {
  document.getElementById("versePopupOverlay").hidden = true;
}

// Remembers the last version the reader was showing, so reopening it (or
// jumping into a different cited verse) keeps the reader's own choice
// instead of resetting to KJV every time.
let currentBibleVersion = "KJV";

function openBibleChapter(book, chapter, highlightStart, highlightEnd) {
  bibleChapterState = {
    book,
    targetChapter: chapter,
    chapter,
    highlightStart,
    highlightEnd,
    selectedVerses: [],
    menuOpen: false,
    noteEditorOpen: false,
    copiedFlash: false,
    version: currentBibleVersion,
    loading: false,
    error: null,
  };
  // Show the overlay before rendering — while it's still `hidden` (display:
  // none) the body has no layout box, so a scrollTop assigned to jump to
  // the cited verse would silently no-op instead of taking effect.
  document.getElementById("bibleChapterOverlay").hidden = false;
  ensureBibleVersionLoadedAndRender();
}

function closeBibleChapter() {
  document.getElementById("bibleChapterOverlay").hidden = true;
  bibleChapterState = null;
}

// Loads (or re-uses the cached) text for the reader's current version,
// showing a loading/error state in the meantime, then renders the
// chapter. Guards every await against the overlay having been closed or
// the version having changed again while the fetch was in flight.
async function ensureBibleVersionLoadedAndRender() {
  const state = bibleChapterState;
  if (!state) return;
  if (isBibleVersionLoaded(state.version)) {
    state.loading = false;
    state.error = null;
    renderBibleChapter();
    return;
  }
  state.loading = true;
  state.error = null;
  renderBibleChapter();
  try {
    await loadBibleVersionText(state.version);
  } catch (e) {
    if (bibleChapterState !== state) return;
    state.loading = false;
    state.error = true;
    renderBibleChapter();
    return;
  }
  if (bibleChapterState !== state) return;
  state.loading = false;
  renderBibleChapter();
}

function changeBibleChapterVersion(newVersion) {
  if (!bibleChapterState || bibleChapterState.version === newVersion) return;
  bibleChapterState.version = newVersion;
  currentBibleVersion = newVersion;
  closeBibleSelection();
  ensureBibleVersionLoadedAndRender();
}

// Ends the current verse selection entirely — used after any mark action
// (color, clear, underline, saved note, copy) so a mis-tap is always just
// one more tap away from gone, and after prev/next chapter navigation
// since a selection never spans chapters.
function closeBibleSelection() {
  if (!bibleChapterState) return;
  bibleChapterState.selectedVerses = [];
  bibleChapterState.menuOpen = false;
  bibleChapterState.noteEditorOpen = false;
  bibleChapterState.copiedFlash = false;
}

function toggleBibleVerseSelection(verseNum) {
  const state = bibleChapterState;
  const idx = state.selectedVerses.indexOf(verseNum);
  if (idx === -1) {
    state.selectedVerses = [...state.selectedVerses, verseNum].sort((a, b) => a - b);
  } else {
    state.selectedVerses = state.selectedVerses.filter((v) => v !== verseNum);
    if (state.selectedVerses.length === 0) {
      state.menuOpen = false;
      state.noteEditorOpen = false;
    }
  }
  renderBibleChapter();
}

function renderBibleMarkToolbar() {
  const toolbar = document.getElementById("bibleChapterMarkToolbar");
  const iconRow = document.getElementById("bibleChapterMarkIconRow");
  const expandedRow = document.getElementById("bibleChapterMarkExpandedRow");
  const noteEditor = document.getElementById("bibleChapterNoteEditor");
  const state = bibleChapterState;

  if (!state || state.selectedVerses.length === 0) {
    toolbar.hidden = true;
    iconRow.hidden = true;
    expandedRow.hidden = true;
    noteEditor.hidden = true;
    return;
  }
  toolbar.hidden = false;

  const { book, chapter, selectedVerses } = state;
  const marks = selectedVerses.map((v) => getBibleVerseMark(book, chapter, v));
  const commonColor = marks.every((m) => m?.color === marks[0]?.color) ? marks[0]?.color : null;
  const allUnderlined = marks.every((m) => m && m.underline);
  const label = state.copiedFlash ? "Copied!" : `Selected: ${selectedVerses.length}`;

  if (state.noteEditorOpen) {
    iconRow.hidden = true;
    expandedRow.hidden = true;
    noteEditor.hidden = false;
    const notes = marks.map((m) => (m && m.note) || "");
    const input = document.getElementById("bibleChapterNoteInput");
    if (document.activeElement !== input) {
      input.value = notes.every((n) => n === notes[0]) ? notes[0] : "";
    }
  } else if (state.menuOpen) {
    iconRow.hidden = true;
    expandedRow.hidden = false;
    noteEditor.hidden = true;
    document.getElementById("bibleChapterMarkLabel2").textContent = label;
    expandedRow.querySelectorAll(".bible-chapter-swatch").forEach((btn) => {
      btn.classList.toggle("active", commonColor === btn.dataset.color);
    });
    document.getElementById("bibleChapterUnderlineBtn").classList.toggle("active", allUnderlined);
  } else {
    iconRow.hidden = false;
    expandedRow.hidden = true;
    noteEditor.hidden = true;
    document.getElementById("bibleChapterMarkLabel1").textContent = label;
  }
}

function renderBibleChapter() {
  if (!bibleChapterState) return;
  const { book, chapter, targetChapter, highlightStart, highlightEnd, selectedVerses, version, loading, error } = bibleChapterState;
  document.getElementById("bibleChapterTitle").textContent = `${book} ${chapter}`;

  const versionSelect = document.getElementById("bibleChapterVersionSelect");
  if (!versionSelect.options.length) {
    versionSelect.innerHTML = BIBLE_VERSIONS.map((v) => `<option value="${v.id}">${v.name} (${v.id})</option>`).join("");
  }
  versionSelect.value = version;

  const statusEl = document.getElementById("bibleChapterVersionStatus");
  const versionName = BIBLE_VERSIONS.find((v) => v.id === version)?.name || version;
  if (loading) {
    statusEl.textContent = `Downloading ${versionName}…`;
    statusEl.hidden = false;
  } else if (error) {
    statusEl.textContent = `Couldn't download ${versionName}. Check your connection and try again.`;
    statusEl.hidden = false;
  } else {
    statusEl.hidden = true;
  }

  const body = document.getElementById("bibleChapterBody");
  body.innerHTML = "";
  const text = bibleVersionTextCache[version];
  const verses = text ? getBibleChapterFrom(text, book, chapter) : null;
  let targetEl = null;
  if (loading) {
    // Loading indicator already shown via statusEl above — leave the body
    // empty rather than flashing a stale chapter or an "unavailable"
    // message while the download is still in flight.
  } else if (error) {
    const p = document.createElement("p");
    p.className = "bible-chapter-verse";
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "bible-chapter-retry-btn";
    retryBtn.textContent = "Try again";
    retryBtn.addEventListener("click", () => ensureBibleVersionLoadedAndRender());
    body.appendChild(retryBtn);
  } else if (!verses) {
    const p = document.createElement("p");
    p.className = "bible-chapter-verse";
    p.textContent = "This chapter isn't available to read here yet.";
    body.appendChild(p);
  } else {
    // A small number of verses in some translations have no text at this
    // slot — for two different real reasons: (1) the translation follows a
    // manuscript tradition that omits a verse the KJV numbering reserved a
    // slot for (e.g. WEB/ASV/BBE's Acts 8:37), or (2) the translation's own
    // chapter/verse divisions genuinely differ from the KJV's, so this
    // slot's content is filed under an adjacent verse or chapter instead
    // (e.g. RVA's Reina-Valera numbering shifts several Job/Numbers/Acts
    // verses across a chapter boundary). Rather than guess which reason
    // applies or skip the slot silently, show a neutral footnote with the
    // KJV's text for reference (KJV always has full text for every verse,
    // since it's the always-bundled fallback translation).
    const kjvChapterVerses = chapterVerses(book, chapter);
    verses.forEach((v) => {
      if (!v.text || !v.text.trim()) {
        const p = document.createElement("p");
        p.className = "bible-chapter-verse bible-chapter-verse-omitted";
        const numSpan = document.createElement("span");
        numSpan.className = "bible-chapter-verse-num";
        numSpan.textContent = v.verse;
        p.appendChild(numSpan);
        const kjvText = kjvChapterVerses?.[v.verse - 1];
        const note = document.createElement("span");
        note.className = "bible-chapter-omitted-note";
        note.textContent = kjvText
          ? `This translation has no separate text for this verse (it may follow a different manuscript tradition, or number its verses differently). For reference, the King James Version reads: “${kjvText}”`
          : "This translation has no separate text for this verse.";
        p.appendChild(note);
        body.appendChild(p);
        return;
      }
      const p = document.createElement("p");
      const isCited = chapter === targetChapter && highlightStart != null && v.verse >= highlightStart && v.verse <= highlightEnd;
      const mark = getBibleVerseMark(book, chapter, v.verse);
      const classes = ["bible-chapter-verse"];
      if (isCited && !mark?.color) classes.push("highlighted");
      if (mark?.underline) classes.push("underlined");
      if (selectedVerses.includes(v.verse)) classes.push("selected");
      p.className = classes.join(" ");
      if (mark?.color) p.style.backgroundColor = HIGHLIGHT_OVERLAY_COLORS[mark.color];
      const numSpan = document.createElement("span");
      numSpan.className = "bible-chapter-verse-num";
      numSpan.textContent = v.verse;
      p.appendChild(numSpan);
      p.appendChild(document.createTextNode(v.text));
      if (mark?.note) {
        const noteSpan = document.createElement("span");
        noteSpan.className = "bible-chapter-note-indicator";
        noteSpan.textContent = " 📝";
        p.appendChild(noteSpan);
      }
      p.addEventListener("click", () => toggleBibleVerseSelection(v.verse));
      body.appendChild(p);
      if (isCited && v.verse === highlightStart) targetEl = p;
    });
  }
  body.scrollTop = targetEl ? Math.max(0, targetEl.offsetTop - 12) : 0;
  renderBibleMarkToolbar();

  const total = text ? bibleChapterCountFrom(text, book) : 0;
  document.getElementById("bibleChapterPrevBtn").disabled = loading || !!error || chapter <= 1;
  document.getElementById("bibleChapterNextBtn").disabled = loading || !!error || chapter >= total;
}

function setupVersePopupAndBibleChapter() {
  document.getElementById("confessionRef").addEventListener("click", () => {
    openVersePopup(document.getElementById("confessionRef").dataset.ref || "");
  });
  document.getElementById("verseRef").addEventListener("click", () => {
    openVersePopup(document.getElementById("verseRef").dataset.ref || "");
  });
  document.getElementById("versePopupCloseBtn").addEventListener("click", closeVersePopup);
  document.getElementById("versePopupOverlay").addEventListener("click", (e) => {
    if (e.target.id === "versePopupOverlay") closeVersePopup();
  });

  document.getElementById("bibleChapterCloseBtn").addEventListener("click", closeBibleChapter);
  document.getElementById("bibleChapterOverlay").addEventListener("click", (e) => {
    if (e.target.id === "bibleChapterOverlay") closeBibleChapter();
  });
  document.getElementById("bibleChapterVersionSelect").addEventListener("change", (e) => {
    changeBibleChapterVersion(e.target.value);
  });
  document.getElementById("bibleChapterPrevBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.loading || bibleChapterState.chapter <= 1) return;
    bibleChapterState.chapter -= 1;
    closeBibleSelection();
    renderBibleChapter();
  });
  document.getElementById("bibleChapterNextBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.loading) return;
    const text = bibleVersionTextCache[bibleChapterState.version];
    const total = text ? bibleChapterCountFrom(text, bibleChapterState.book) : 0;
    if (bibleChapterState.chapter >= total) return;
    bibleChapterState.chapter += 1;
    closeBibleSelection();
    renderBibleChapter();
  });

  document.getElementById("bibleChapterMarkIconBtn").addEventListener("click", () => {
    if (!bibleChapterState) return;
    bibleChapterState.menuOpen = true;
    renderBibleMarkToolbar();
  });

  document.querySelectorAll("#bibleChapterMarkExpandedRow .bible-chapter-swatch").forEach((btn) => {
    btn.style.backgroundColor = HIGHLIGHT_SWATCH_COLORS[btn.dataset.color];
    btn.addEventListener("click", () => {
      if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
      setBibleVersesColor(bibleChapterState.book, bibleChapterState.chapter, bibleChapterState.selectedVerses, btn.dataset.color);
      closeBibleSelection();
      renderBibleChapter();
    });
  });
  document.getElementById("bibleChapterClearBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
    clearBibleVersesMarks(bibleChapterState.book, bibleChapterState.chapter, bibleChapterState.selectedVerses);
    closeBibleSelection();
    renderBibleChapter();
  });
  document.getElementById("bibleChapterUnderlineBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
    const { book, chapter, selectedVerses } = bibleChapterState;
    const allUnderlined = selectedVerses.every((v) => getBibleVerseMark(book, chapter, v)?.underline);
    setBibleVersesUnderline(book, chapter, selectedVerses, !allUnderlined);
    closeBibleSelection();
    renderBibleChapter();
  });

  document.getElementById("bibleChapterNoteBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
    bibleChapterState.noteEditorOpen = true;
    renderBibleMarkToolbar();
    document.getElementById("bibleChapterNoteInput").focus();
  });
  document.getElementById("bibleChapterNoteCancelBtn").addEventListener("click", () => {
    if (!bibleChapterState) return;
    bibleChapterState.noteEditorOpen = false;
    renderBibleMarkToolbar();
  });
  document.getElementById("bibleChapterNoteSaveBtn").addEventListener("click", () => {
    if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
    const text = document.getElementById("bibleChapterNoteInput").value;
    setBibleVersesNote(bibleChapterState.book, bibleChapterState.chapter, bibleChapterState.selectedVerses, text);
    closeBibleSelection();
    renderBibleChapter();
  });

  document.getElementById("bibleChapterCopyBtn").addEventListener("click", async () => {
    if (!bibleChapterState || bibleChapterState.selectedVerses.length === 0) return;
    const { book, chapter, version, selectedVerses } = bibleChapterState;
    const versionText = bibleVersionTextCache[version];
    const verses = (versionText && getBibleChapterFrom(versionText, book, chapter)) || [];
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const text = sorted
      .map((vNum) => verses.find((v) => v.verse === vNum)?.text)
      .filter(Boolean)
      .join(" ");
    const ref = `${book} ${chapter}:${formatBibleVerseRanges(sorted)}`;
    await copyTextToClipboard(`“${text}” — ${ref}`);
    if (!bibleChapterState) return;
    bibleChapterState.copiedFlash = true;
    renderBibleMarkToolbar();
    setTimeout(() => {
      if (!bibleChapterState) return;
      closeBibleSelection();
      renderBibleChapter();
    }, 900);
  });
}

// --- Full Bible browser: reached via the ☰ menu, independent of any --
// cited verse. Book list -> chapter grid -> opens the same chapter
// reader used everywhere else. Chapter counts are read from the always-
// bundled KJV data purely to populate the picker (chapter divisions are
// standard across translations) — no download is needed until the user
// actually opens a chapter.
let bibleBrowserState = { book: null };

function openBibleBrowser() {
  bibleBrowserState = { book: null };
  renderBibleBrowser();
  document.getElementById("bibleBrowserOverlay").hidden = false;
}

function closeBibleBrowser() {
  document.getElementById("bibleBrowserOverlay").hidden = true;
}

function renderBibleBrowser() {
  const { book } = bibleBrowserState;
  const bookListEl = document.getElementById("bibleBrowserBookList");
  const chapterGridEl = document.getElementById("bibleBrowserChapterGrid");
  const backBtn = document.getElementById("bibleBrowserBackBtn");
  const titleEl = document.getElementById("bibleBrowserTitle");

  if (!book) {
    titleEl.textContent = "Read the Bible";
    backBtn.hidden = true;
    chapterGridEl.hidden = true;
    bookListEl.hidden = false;
    if (!bookListEl.childElementCount) {
      bookListEl.innerHTML = BIBLE_BOOKS.map(
        (name) => `<button type="button" class="bible-browser-item" data-book="${name}">${name}</button>`
      ).join("");
      bookListEl.querySelectorAll(".bible-browser-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          bibleBrowserState.book = btn.dataset.book;
          renderBibleBrowser();
        });
      });
    }
    return;
  }

  titleEl.textContent = book;
  backBtn.hidden = false;
  bookListEl.hidden = true;
  chapterGridEl.hidden = false;
  const total = bibleChapterCount(book);
  const items = [];
  for (let c = 1; c <= total; c++) {
    items.push(`<button type="button" class="bible-browser-item bible-browser-chapter" data-chapter="${c}">${c}</button>`);
  }
  chapterGridEl.innerHTML = items.join("");
  chapterGridEl.querySelectorAll(".bible-browser-chapter").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeBibleBrowser();
      openBibleChapter(book, parseInt(btn.dataset.chapter, 10), null, null);
    });
  });
}

function setupBibleBrowser() {
  document.getElementById("menuBibleBtn").addEventListener("click", () => {
    closeMenu();
    openBibleBrowser();
  });
  document.getElementById("bibleBrowserCloseBtn").addEventListener("click", closeBibleBrowser);
  document.getElementById("bibleBrowserOverlay").addEventListener("click", (e) => {
    if (e.target.id === "bibleBrowserOverlay") closeBibleBrowser();
  });
  document.getElementById("bibleBrowserBackBtn").addEventListener("click", () => {
    bibleBrowserState.book = null;
    renderBibleBrowser();
  });
}

async function shareMoment(day) {
  const entry = ensureDayEntry(day);
  const moment = entry.customMoment || pickForDay(BARNABAS_MOMENTS, day, state.order);
  const message = `A little encouragement from me to you today: ${moment}\n\n— sent from Barnabas Journal`;
  const result = await shareText(message);
  const msgEl = document.getElementById("momentShareMsg");
  if (result === "copied") {
    msgEl.textContent = "Copied! Paste it into a text or message to send it.";
    msgEl.hidden = false;
    setTimeout(() => { msgEl.hidden = true; }, 4000);
  } else if (result === "failed") {
    msgEl.textContent = `Couldn't copy automatically — here it is to copy by hand: "${message}"`;
    msgEl.hidden = false;
  } else {
    msgEl.hidden = true;
  }
}

async function reachOut() {
  const message = "Hey, I wanted to reach out today — just thinking of you. How are you doing?";
  const result = await shareText(message);
  const msgEl = document.getElementById("reachOutMsg");
  if (result === "copied") {
    msgEl.textContent = "Copied! Paste it into a text or message to send it.";
    msgEl.hidden = false;
    setTimeout(() => { msgEl.hidden = true; }, 4000);
  } else if (result === "failed") {
    msgEl.textContent = `Couldn't copy automatically — here it is to copy by hand: "${message}"`;
    msgEl.hidden = false;
  } else {
    msgEl.hidden = true;
  }
}

async function talkToSomeone() {
  const message = "Hey, do you have a few minutes to talk? I could use a listening ear lately.";
  const result = await shareText(message);
  const msgEl = document.getElementById("talkToSomeoneMsg");
  if (result === "copied") {
    msgEl.textContent = "Copied! Paste it into a text or message to send it.";
    msgEl.hidden = false;
    setTimeout(() => { msgEl.hidden = true; }, 4000);
  } else if (result === "failed") {
    msgEl.textContent = `Couldn't copy automatically — here it is to copy by hand: "${message}"`;
    msgEl.hidden = false;
  } else {
    msgEl.hidden = true;
  }
}

function showShareMsg(elId, result) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (result === "downloaded") {
    el.textContent = "Image saved — share it from your downloads.";
  } else if (result === "shared") {
    el.textContent = "Shared. Thank you for passing it on!";
  } else {
    return;
  }
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 4000);
}

// ---------- Onboarding ----------

function maybeShowOnboarding() {
  if (state.settings.onboarded) return;
  document.getElementById("onboardingOverlay").hidden = false;
}

function completeOnboarding() {
  state.settings.onboarded = true;
  saveState(state);
  document.getElementById("onboardingOverlay").hidden = true;
}

// ---------- Rendering ----------

function renderToday() {
  const day = viewingDay;
  const isToday = day === unlockedDay();

  const followUpCard = document.getElementById("momentFollowUpCard");
  const prevDayNumber = unlockedDay() - 1;
  const prevEntry = prevDayNumber >= 1 ? state.entries[`day-${prevDayNumber}`] : null;
  const showFollowUp =
    isToday && prevDayNumber >= 1 && !(prevEntry && prevEntry.momentDone) && !(prevEntry && prevEntry.momentFollowUpAsked);
  followUpCard.hidden = !showFollowUp;
  if (showFollowUp) {
    document.getElementById("momentFollowUpText").textContent =
      (prevEntry && prevEntry.customMoment) || pickForDay(BARNABAS_MOMENTS, prevDayNumber, state.order);
  }

  // Shown only on two calendar weekdays (Wednesday, Saturday) — a deliberate
  // once-or-twice-a-week cadence, not a daily nag, so it keeps its weight.
  const callNudgeCard = document.getElementById("callNudgeCard");
  const todayWeekday = new Date().getDay();
  const showCallNudge = isToday && (todayWeekday === 3 || todayWeekday === 6);
  callNudgeCard.hidden = !showCallNudge;

  const crisisCard = document.getElementById("crisisCard");
  const showCrisisNudge =
    isToday && computeShowCrisisNudge(state.entries, unlockedDay(), state.settings.lastCrisisNudgeShownAt);
  crisisCard.hidden = !showCrisisNudge;
  if (showCrisisNudge && state.settings.lastCrisisNudgeShownAt !== todayDateKey()) {
    state.settings.lastCrisisNudgeShownAt = todayDateKey();
    saveState(state);
  }

  const checkInNudgeCard = document.getElementById("checkInNudgeCard");
  const checkInTalkVariant = document.getElementById("checkInTalkVariant");
  const checkInGratitudeVariant = document.getElementById("checkInGratitudeVariant");
  const showCheckInNudge =
    isToday &&
    computeShowCheckInNudge(state.entries, unlockedDay(), state.settings.lastCheckInNudgeShownAt, showCrisisNudge);
  checkInNudgeCard.hidden = !showCheckInNudge;
  if (showCheckInNudge) {
    const variant = unlockedDay() % 2 === 0 ? "talk" : "gratitude";
    checkInTalkVariant.hidden = variant !== "talk";
    checkInGratitudeVariant.hidden = variant !== "gratitude";
  }
  if (showCheckInNudge && state.settings.lastCheckInNudgeShownAt !== todayDateKey()) {
    state.settings.lastCheckInNudgeShownAt = todayDateKey();
    saveState(state);
  }

  document.getElementById("supportSection").hidden = !(showCallNudge || showCrisisNudge || showCheckInNudge);

  const verse = getVerseForDay(day);
  document.getElementById("verseText").textContent = `“${verse.text}”`;
  const verseRefBtn = document.getElementById("verseRef");
  verseRefBtn.textContent = `${verse.ref} (${verse.version})`;
  verseRefBtn.dataset.ref = verse.ref;
  updateFavoriteBtn("verseFavoriteBtn", "verse", day);

  const confession = pickForDay(CONFESSIONS, day, state.order);
  document.getElementById("confessionText").textContent = confession.text;
  const confessionRefBtn = document.getElementById("confessionRef");
  confessionRefBtn.textContent = `— ${confession.ref}`;
  confessionRefBtn.dataset.ref = confession.ref;
  updateFavoriteBtn("confessionFavoriteBtn", "confession", day);

  document.getElementById("encouragementText").textContent = pickForDay(ENCOURAGEMENTS, day, state.order);

  const quote = pickForDaySmallBank(QUOTES, day, state.order);
  document.getElementById("wisdomText").textContent = `“${quote.text}”`;
  document.getElementById("wisdomSource").textContent = `— ${quote.source}`;
  updateFavoriteBtn("wisdomFavoriteBtn", "wisdom", day);

  const entry = ensureDayEntry(day);
  awardStars(entry, "daily", 1);
  saveState(state);

  const suggestedMoment = pickForDay(BARNABAS_MOMENTS, day, state.order);
  document.getElementById("momentText").textContent = entry.customMoment || suggestedMoment;

  const customMomentRow = document.getElementById("customMomentRow");
  const customMomentPrompt = document.getElementById("customMomentPrompt");
  const customMomentLinkBtn = document.getElementById("customMomentLinkBtn");
  if (entry.momentDone) {
    customMomentRow.hidden = true;
    customMomentPrompt.hidden = true;
    customMomentLinkBtn.hidden = true;
  } else if (entry.customMoment) {
    customMomentRow.hidden = false;
    customMomentPrompt.hidden = true;
    customMomentLinkBtn.hidden = true;
  } else if (showCustomMomentInputUI) {
    customMomentRow.hidden = true;
    customMomentPrompt.hidden = false;
    customMomentLinkBtn.hidden = true;
  } else {
    customMomentRow.hidden = true;
    customMomentPrompt.hidden = true;
    customMomentLinkBtn.hidden = false;
  }

  const wordReflectLinkBtn = document.getElementById("wordReflectLinkBtn");
  const wordReflectPrompt = document.getElementById("wordReflectPrompt");
  if (entry.reflection) {
    wordReflectLinkBtn.hidden = true;
    wordReflectPrompt.hidden = true;
  } else if (showWordReflectInputUI) {
    wordReflectLinkBtn.hidden = true;
    wordReflectPrompt.hidden = false;
    document.getElementById("wordReflectInput").value = "";
  } else {
    wordReflectLinkBtn.hidden = false;
    wordReflectPrompt.hidden = true;
  }

  const momentBtn = document.getElementById("momentBtn");
  const momentMsg = document.getElementById("momentDoneMsg");
  const momentReflectPrompt = document.getElementById("momentReflectPrompt");
  if (entry.momentDone) {
    momentBtn.disabled = true;
    momentBtn.textContent = "Done ✓";
    momentMsg.hidden = false;
    if (!entry.barnabasNote) {
      momentReflectPrompt.hidden = false;
      document.getElementById("momentReflectInput").value = "";
    } else {
      momentReflectPrompt.hidden = true;
    }
  } else {
    momentBtn.disabled = false;
    momentBtn.textContent = isToday ? "I did this today ✓" : "I did this ✓";
    momentMsg.hidden = true;
    momentReflectPrompt.hidden = true;
  }

  const intentionPrompt = document.getElementById("momentIntentionPrompt");
  const intentionRow = document.getElementById("momentIntentionRow");
  if (isToday && !entry.momentDone) {
    if (entry.momentIntention) {
      intentionPrompt.hidden = true;
      intentionRow.hidden = false;
      document.getElementById("momentIntentionText").textContent =
        `Planned for: ${INTENTION_LABELS[entry.momentIntention]}`;
    } else {
      intentionPrompt.hidden = false;
      intentionRow.hidden = true;
    }
  } else {
    intentionPrompt.hidden = true;
    intentionRow.hidden = true;
  }

  reflectRowsConfig().forEach((cfg) => syncAccordionRow(cfg, entry, true));
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.mood === entry.mood);
  });

  renderDayNav();
  renderHeaderStats();
}

function renderStory() {
  const day = viewingDay;
  const story = pickForDaySmallBank(STORIES, day, state.order);
  document.getElementById("storyTitle").textContent = story.title;
  document.getElementById("storyText").textContent = story.text;
  document.getElementById("storyInsightText").textContent = story.insight || "";
  updateFavoriteBtn("storyFavoriteBtn", "truestory", day);

  const panel = document.getElementById("storyInsightPanel");
  const btn = document.getElementById("storyInsightBtn");
  panel.hidden = !showStoryInsightUI;
  btn.setAttribute("aria-expanded", String(showStoryInsightUI));
}

function updateFavoriteBtn(btnId, type, day) {
  const btn = document.getElementById(btnId);
  const on = isFavorited(type, day);
  btn.textContent = on ? "★ Saved" : "☆ Save";
  btn.classList.toggle("favorited", on);
}

function renderDayNav() {
  const day = viewingDay;
  const latest = unlockedDay();
  const isToday = day === latest;

  document.getElementById("dayLabel").textContent = isToday ? `Today · Day ${day}` : `Day ${day}`;
  document.getElementById("dayNavPrev").disabled = day <= 1;
  document.getElementById("dayNavNext").disabled = day >= latest;
  document.getElementById("dayNavJump").hidden = isToday;

  const reflectionLabel = isToday ? "Today's Reflection" : `Day ${day}'s Reflection`;
  document.getElementById("reflectionCardLabel").textContent = reflectionLabel;

  const saveMsg = document.getElementById("saveMsg");
  saveMsg.textContent = isToday
    ? "Saved gently. Thank you for showing up today. ⭐⭐"
    : "Saved gently. Thank you for going back to this day. ⭐⭐";
}

function renderHeaderStats() {
  document.getElementById("statTotalStars").textContent = state.totalStars;
  document.getElementById("statStreak").textContent = computeStreak();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const empty = document.getElementById("historyEmpty");
  const noMatch = document.getElementById("historyNoMatch");
  const query = (document.getElementById("historySearch").value || "").trim().toLowerCase();
  const allKeys = Object.keys(state.entries)
    .filter((k) => {
      const e = state.entries[k];
      return e.reflection || e.barnabasNote || e.receivedKindness || e.momentDone;
    })
    .sort((a, b) => state.entries[b].dayNumber - state.entries[a].dayNumber);

  if (allKeys.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    noMatch.hidden = true;
    return;
  }
  empty.hidden = true;

  const keys = query
    ? allKeys.filter((k) => {
        const e = state.entries[k];
        return (
          (e.reflection && e.reflection.toLowerCase().includes(query)) ||
          (e.barnabasNote && e.barnabasNote.toLowerCase().includes(query)) ||
          (e.receivedKindness && e.receivedKindness.toLowerCase().includes(query))
        );
      })
    : allKeys;

  if (keys.length === 0) {
    list.innerHTML = "";
    noMatch.hidden = false;
    return;
  }
  noMatch.hidden = true;

  const moodEmoji = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

  list.innerHTML = keys
    .map((key) => {
      const e = state.entries[key];
      const parts = [];
      if (e.reflection) {
        parts.push(`<div class="history-block"><div class="history-block-label">Reflection</div>${escapeHtml(e.reflection)}</div>`);
      }
      if (e.barnabasNote) {
        parts.push(`<div class="history-block"><div class="history-block-label">Barnabas Moment</div>${escapeHtml(e.barnabasNote)}</div>`);
      }
      if (e.momentDone && !e.barnabasNote) {
        parts.push(`<div class="history-block"><div class="history-block-label">Barnabas Moment</div>Marked as done.</div>`);
      }
      if (e.receivedKindness) {
        parts.push(`<div class="history-block"><div class="history-block-label">Kindness Received</div>${escapeHtml(e.receivedKindness)}</div>`);
      }
      const mood = e.mood ? moodEmoji[e.mood] || "" : "";
      return `<div class="history-entry">
        <div class="history-date"><span>Day ${e.dayNumber} · ${formatDate(e.dateLogged)}</span><span class="history-mood">${mood}</span></div>
        ${parts.join("")}
      </div>`;
    })
    .join("");
}

// f.type is "verse", "wisdom" (quotes), or "truestory". Older favorites saved
// before the content split could be a "wisdom" entry with a title (from when
// WISDOM mixed in short fictional vignettes) — keep labeling those as
// "Story" so previously-saved favorites don't look wrong.
function favoriteKindLabel(f) {
  if (f.type === "verse") return "Verse";
  if (f.type === "confession") return "Confession";
  if (f.type === "truestory") return "True Story";
  if (f.type === "wisdom" && f.title) return "Story";
  return "Quote";
}

function favoriteSourceLine(f) {
  if (f.type === "verse") return f.ref;
  if (f.type === "confession") return f.ref;
  if (f.type === "truestory") return f.title;
  if (f.type === "wisdom" && f.title) return f.title;
  return `— ${f.source || ""}`;
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const empty = document.getElementById("favoritesEmpty");
  const noMatch = document.getElementById("favoritesNoMatch");
  const query = (document.getElementById("favoritesSearch").value || "").trim().toLowerCase();
  const allFavorites = state.favorites.slice().sort((a, b) => b.dayNumber - a.dayNumber);

  if (allFavorites.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    noMatch.hidden = true;
    return;
  }
  empty.hidden = true;

  const favorites = query
    ? allFavorites.filter((f) => {
        const sourceLine = favoriteSourceLine(f);
        return (
          (f.text && f.text.toLowerCase().includes(query)) ||
          (sourceLine && sourceLine.toLowerCase().includes(query))
        );
      })
    : allFavorites;

  if (favorites.length === 0) {
    list.innerHTML = "";
    noMatch.hidden = false;
    return;
  }
  noMatch.hidden = true;

  list.innerHTML = favorites
    .map((f) => {
      const kindLabel = favoriteKindLabel(f);
      const sourceLine = favoriteSourceLine(f);
      return `<div class="favorite-entry">
        <div class="favorite-header">
          <span class="favorite-kind">${kindLabel} · Day ${f.dayNumber}</span>
          <button class="favorite-remove" data-id="${f.id}" aria-label="Remove from favorites">✕</button>
        </div>
        <p class="favorite-text">“${escapeHtml(f.text)}”</p>
        <p class="favorite-source">${escapeHtml(sourceLine)}</p>
      </div>`;
    })
    .join("");

  list.querySelectorAll(".favorite-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      state.favorites = state.favorites.filter((f) => f.id !== id);
      saveState(state);
      renderFavorites();
      renderToday();
    });
  });
}

function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural || `${singular}s`}`;
}

function renderWeeklyRecap() {
  const recap = computeWeeklyRecap(state.entries, unlockedDay());
  const card = document.getElementById("weeklyRecapCard");
  if (recap.totalDays < 2) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  document.getElementById("weeklyRecapText").textContent =
    `Over the last ${pluralize(recap.totalDays, "day")}, you showed up ${pluralize(recap.daysShownUp, "day")}, ` +
    `did ${pluralize(recap.momentsDone, "Barnabas Moment")}, and wrote ${pluralize(recap.journalEntries, "journal entry", "journal entries")}.`;
  document.getElementById("weeklyRecapReceivedText").textContent =
    recap.kindnessReceived > 0
      ? `And you noticed kindness coming your way ${pluralize(recap.kindnessReceived, "time")} — you're being watered too, not just pouring out.`
      : "He who waters others is himself watered — don't forget to notice when kindness comes your way, too.";
}

function renderRewards() {
  document.getElementById("rewardStars").textContent = state.totalStars;
  document.getElementById("rewardStreak").textContent = computeStreak();
  document.getElementById("rewardMoments").textContent = countMomentsDone();
  renderWeeklyRecap();

  const streak = computeStreak();
  const grid = document.getElementById("badgesGrid");
  grid.innerHTML = BADGE_DEFS
    .map((b) => {
      const value = b.type === "stars" ? state.totalStars : streak;
      const earned = value >= b.threshold;
      return `<div class="badge ${earned ? "earned" : ""}">
        <span class="badge-icon">${b.icon}</span>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>`;
    })
    .join("");
}

function renderOnThisDay() {
  const card = document.getElementById("onThisDayCard");
  const textEl = document.getElementById("onThisDayText");
  const latest = unlockedDay();
  const offsets = [
    { days: 365, label: "a year ago" },
    { days: 90, label: "three months ago" },
    { days: 30, label: "a month ago" },
    { days: 7, label: "a week ago" },
  ];
  for (const { days, label } of offsets) {
    const dayNumber = latest - days;
    if (dayNumber < 1) continue;
    const entry = state.entries[`day-${dayNumber}`];
    const snippet = entry && (entry.reflection || entry.barnabasNote || entry.receivedKindness);
    if (snippet) {
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      textEl.textContent = `${capitalized} (Day ${dayNumber}), you wrote: "${snippet}"`;
      card.hidden = false;
      return;
    }
  }
  card.hidden = true;
}

function renderMoodCalendar() {
  const grid = document.getElementById("moodCalendar");
  const legend = document.getElementById("moodLegend");
  const latest = unlockedDay();
  const start = Math.max(1, latest - 34);

  let html = "";
  for (let day = start; day <= latest; day++) {
    const entry = state.entries[`day-${day}`];
    const mood = entry && entry.mood;
    const emoji = mood ? MOOD_EMOJI[mood] : "";
    const dateLabel = entry ? formatDate(entry.dateLogged) : `Day ${day}`;
    const cls = `mood-cell${mood ? ` mood-${mood}` : " mood-empty"}`;
    html += `<div class="${cls}" title="${escapeHtml(dateLabel)}">${emoji}</div>`;
  }
  grid.innerHTML = html;

  legend.innerHTML = Object.entries(MOOD_EMOJI)
    .map(([mood, emoji]) => `<span class="mood-legend-item">${emoji} ${mood.charAt(0).toUpperCase()}${mood.slice(1)}</span>`)
    .join("");
}

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Events ----------

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
      if (btn.dataset.tab === "story") renderStory();
      if (btn.dataset.tab === "history") { renderHistory(); renderOnThisDay(); }
      if (btn.dataset.tab === "rewards") { renderRewards(); renderMoodCalendar(); }
      if (btn.dataset.tab === "favorites") renderFavorites();
    });
  });
}

function setupSearch() {
  document.getElementById("historySearch").addEventListener("input", renderHistory);
  document.getElementById("favoritesSearch").addEventListener("input", renderFavorites);
}

function setupDayNav() {
  document.getElementById("dayNavPrev").addEventListener("click", () => {
    if (viewingDay > 1) {
      viewingDay -= 1;
      showCustomMomentInputUI = false;
      showWordReflectInputUI = false;
      showStoryInsightUI = false;
      initReflectAccordionForDay(ensureDayEntry(viewingDay));
      renderToday();
      renderStory();
    }
  });
  document.getElementById("dayNavNext").addEventListener("click", () => {
    if (viewingDay < unlockedDay()) {
      viewingDay += 1;
      showCustomMomentInputUI = false;
      showWordReflectInputUI = false;
      showStoryInsightUI = false;
      initReflectAccordionForDay(ensureDayEntry(viewingDay));
      renderToday();
      renderStory();
    }
  });
  document.getElementById("dayNavJump").addEventListener("click", () => {
    viewingDay = unlockedDay();
    showCustomMomentInputUI = false;
    showWordReflectInputUI = false;
    showStoryInsightUI = false;
    initReflectAccordionForDay(ensureDayEntry(viewingDay));
    renderToday();
    renderStory();
  });
}

function setupMoodPicker() {
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      const entry = ensureDayEntry(viewingDay);
      entry.mood = btn.dataset.mood;
      saveState(state);
    });
  });
}

function setupMomentButton() {
  document.getElementById("momentBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    if (entry.momentDone) return;
    entry.momentDone = true;
    awardStars(entry, "moment", 2);
    saveState(state);
    renderToday();
  });
}

const INTENTION_LABELS = { today: "Today", tonight: "Tonight", tomorrow: "Tomorrow morning" };

function setupMomentIntention() {
  document.querySelectorAll(".intention-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const entry = ensureDayEntry(viewingDay);
      entry.momentIntention = btn.dataset.intention;
      saveState(state);
      renderToday();
    });
  });
  document.getElementById("momentIntentionChangeBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.momentIntention = null;
    saveState(state);
    renderToday();
  });
}

function setupCustomMoment() {
  document.getElementById("customMomentLinkBtn").addEventListener("click", () => {
    showCustomMomentInputUI = true;
    renderToday();
  });
  document.getElementById("cancelCustomMomentBtn").addEventListener("click", () => {
    showCustomMomentInputUI = false;
    renderToday();
  });
  document.getElementById("useCustomMomentBtn").addEventListener("click", () => {
    const text = document.getElementById("customMomentInput").value.trim();
    if (!text) return;
    const entry = ensureDayEntry(viewingDay);
    entry.customMoment = text;
    showCustomMomentInputUI = false;
    saveState(state);
    renderToday();
  });
  document.getElementById("useSuggestionBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.customMoment = null;
    saveState(state);
    renderToday();
  });
}

function setupWordReflect() {
  document.getElementById("wordReflectLinkBtn").addEventListener("click", () => {
    showWordReflectInputUI = true;
    renderToday();
  });
  document.getElementById("wordReflectCancelBtn").addEventListener("click", () => {
    showWordReflectInputUI = false;
    renderToday();
  });
  document.getElementById("wordReflectSaveBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.reflection = document.getElementById("wordReflectInput").value.trim();
    if (entry.reflection || entry.barnabasNote || entry.receivedKindness) {
      awardStars(entry, "journal", 2);
    }
    showWordReflectInputUI = false;
    saveState(state);
    renderToday();
    renderHeaderStats();
    const msg = document.getElementById("wordReflectSavedMsg");
    msg.hidden = false;
    setTimeout(() => { msg.hidden = true; }, 2500);
  });
}

function setupStoryInsight() {
  document.getElementById("storyInsightBtn").addEventListener("click", () => {
    showStoryInsightUI = !showStoryInsightUI;
    renderStory();
  });
}

function setupReflectAccordion() {
  document.querySelectorAll(".accordion-row-head").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.accordion;
      reflectAccordionOpen[key] = !reflectAccordionOpen[key];
      const cfg = reflectRowsConfig().find((r) => r.key === key);
      syncAccordionRow(cfg, ensureDayEntry(viewingDay), false);
    });
  });
}

function answerMomentFollowUp(status) {
  const prevDayNumber = unlockedDay() - 1;
  if (prevDayNumber < 1) return;
  const entry = ensureDayEntry(prevDayNumber);
  entry.momentFollowUpAsked = true;
  entry.momentFollowUpStatus = status;
  if (status === "done" && !entry.momentDone) {
    entry.momentDone = true;
    awardStars(entry, "moment", 2);
  }
  saveState(state);
  renderToday();
  renderHeaderStats();
}

function setupMomentReflect() {
  document.getElementById("momentReflectSaveBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.barnabasNote = document.getElementById("momentReflectInput").value.trim();
    if (entry.reflection || entry.barnabasNote) {
      awardStars(entry, "journal", 2);
    }
    saveState(state);
    renderToday();
    renderHeaderStats();
    const msg = document.getElementById("momentReflectSavedMsg");
    msg.hidden = false;
    setTimeout(() => { msg.hidden = true; }, 2500);
  });
}

function setupMomentFollowUp() {
  document.querySelectorAll(".follow-up-btn").forEach((btn) => {
    btn.addEventListener("click", () => answerMomentFollowUp(btn.dataset.status));
  });
}

function setupSaveReflection() {
  document.getElementById("saveReflectionBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.reflection = document.getElementById("reflectionInput").value.trim();
    entry.barnabasNote = document.getElementById("barnabasInput").value.trim();
    entry.receivedKindness = document.getElementById("receivedKindnessInput").value.trim();
    if (entry.reflection || entry.barnabasNote || entry.receivedKindness) {
      awardStars(entry, "journal", 2);
    }
    saveState(state);
    renderHeaderStats();
    const msg = document.getElementById("saveMsg");
    msg.hidden = false;
    setTimeout(() => { msg.hidden = true; }, 3000);
  });
}

function setupFavoriteButtons() {
  document.getElementById("verseFavoriteBtn").addEventListener("click", () => {
    const verse = getVerseForDay(viewingDay);
    toggleFavorite("verse", viewingDay, { text: verse.text, ref: `${verse.ref} (${verse.version})` });
    updateFavoriteBtn("verseFavoriteBtn", "verse", viewingDay);
  });
  document.getElementById("confessionFavoriteBtn").addEventListener("click", () => {
    const confession = pickForDay(CONFESSIONS, viewingDay, state.order);
    toggleFavorite("confession", viewingDay, { text: confession.text, ref: confession.ref });
    updateFavoriteBtn("confessionFavoriteBtn", "confession", viewingDay);
  });
  document.getElementById("wisdomFavoriteBtn").addEventListener("click", () => {
    const quote = pickForDaySmallBank(QUOTES, viewingDay, state.order);
    toggleFavorite("wisdom", viewingDay, { text: quote.text, source: quote.source || "" });
    updateFavoriteBtn("wisdomFavoriteBtn", "wisdom", viewingDay);
  });
  document.getElementById("storyFavoriteBtn").addEventListener("click", () => {
    const story = pickForDaySmallBank(STORIES, viewingDay, state.order);
    toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title });
    updateFavoriteBtn("storyFavoriteBtn", "truestory", viewingDay);
  });
}

function setupShareButtons() {
  document.getElementById("verseShareBtn").addEventListener("click", () => {
    const verse = getVerseForDay(viewingDay);
    openSharePreview(verse.text, `${verse.ref} (${verse.version})`, "verse", "verseShareMsg", viewingDay);
  });
  document.getElementById("confessionShareBtn").addEventListener("click", () => {
    const confession = pickForDay(CONFESSIONS, viewingDay, state.order);
    openSharePreview(confession.text, confession.ref, "confession", "confessionShareMsg", viewingDay);
  });
  document.getElementById("wisdomShareBtn").addEventListener("click", () => {
    const quote = pickForDaySmallBank(QUOTES, viewingDay, state.order);
    openSharePreview(quote.text, `— ${quote.source || ""}`, "quote", "wisdomShareMsg", viewingDay);
  });
  document.getElementById("storyShareBtn").addEventListener("click", () => {
    const story = pickForDaySmallBank(STORIES, viewingDay, state.order);
    openSharePreview(story.text, story.title, "story", "storyShareMsg", viewingDay);
  });
  document.getElementById("momentShareBtn").addEventListener("click", () => {
    shareMoment(viewingDay);
  });
  document.getElementById("reachOutBtn").addEventListener("click", reachOut);
  const talkToSomeoneBtn = document.getElementById("talkToSomeoneBtn");
  if (talkToSomeoneBtn) talkToSomeoneBtn.addEventListener("click", talkToSomeone);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = state.settings.speechRate;
  utterance.pitch = state.settings.speechPitch;
  const voice = window.speechSynthesis
    .getVoices()
    .find((v) => v.voiceURI === state.settings.speechVoiceURI);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

function populateVoiceList() {
  if (!window.speechSynthesis) return;
  const select = document.getElementById("voiceSelect");
  const voices = window.speechSynthesis.getVoices();
  const current = state.settings.speechVoiceURI;
  select.innerHTML =
    `<option value="">Default</option>` +
    voices.map((v) => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`).join("");
  select.value = voices.some((v) => v.voiceURI === current) ? current : "";
}

function setupVoiceSettings() {
  if (!window.speechSynthesis) {
    const section = document.getElementById("voiceSettingsSection");
    if (section) section.hidden = true;
    return;
  }

  populateVoiceList();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  const pitchRange = document.getElementById("pitchRange");
  const rateRange = document.getElementById("rateRange");
  pitchRange.value = state.settings.speechPitch;
  rateRange.value = state.settings.speechRate;

  document.getElementById("voiceSelect").addEventListener("change", (e) => {
    state.settings.speechVoiceURI = e.target.value;
    saveState(state);
  });
  pitchRange.addEventListener("input", (e) => {
    state.settings.speechPitch = Number(e.target.value);
    saveState(state);
  });
  rateRange.addEventListener("input", (e) => {
    state.settings.speechRate = Number(e.target.value);
    saveState(state);
  });
  document.getElementById("testVoiceBtn").addEventListener("click", () => {
    speak("This is what the voice will sound like when reading your verse or story aloud.");
  });
}

function setupListenButtons() {
  const ids = ["verseListenBtn", "confessionListenBtn", "encouragementListenBtn", "storyListenBtn"];
  if (!window.speechSynthesis) {
    ids.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.hidden = true;
    });
    return;
  }
  document.getElementById("verseListenBtn").addEventListener("click", () => {
    const verse = getVerseForDay(viewingDay);
    speak(`${verse.text} — ${verse.ref}`);
  });
  document.getElementById("confessionListenBtn").addEventListener("click", () => {
    const confession = pickForDay(CONFESSIONS, viewingDay, state.order);
    speak(`${confession.text} — ${confession.ref}`);
  });
  document.getElementById("encouragementListenBtn").addEventListener("click", () => {
    speak(pickForDay(ENCOURAGEMENTS, viewingDay, state.order));
  });
  document.getElementById("storyListenBtn").addEventListener("click", () => {
    const story = pickForDaySmallBank(STORIES, viewingDay, state.order);
    speak(`${story.title}. ${story.text}`);
  });
}

function setupThemeToggle() {
  document.getElementById("settingsThemeToggle").addEventListener("click", toggleTheme);
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (state.settings.theme === "system") applyTheme();
    });
  }
}

function openSettings() {
  renderLastBackupNote();
  renderVerseVersionSettings();
  document.getElementById("settingsOverlay").hidden = false;
}

function closeSettings() {
  document.getElementById("settingsOverlay").hidden = true;
}

function setupSettings() {
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettings);
  document.getElementById("settingsOverlay").addEventListener("click", (e) => {
    if (e.target.id === "settingsOverlay") closeSettings();
  });
}

function renderVerseVersionSettings() {
  const select = document.getElementById("verseFavoriteSelect");
  if (!select.options.length) {
    select.innerHTML = BIBLE_VERSIONS.map((v) => `<option value="${v.id}">${v.name} (${v.id})</option>`).join("");
  }
  const isFavoriteMode = state.settings.verseVersionMode === "favorite";
  document.getElementById("verseModeAlternateBtn").classList.toggle("selected", !isFavoriteMode);
  document.getElementById("verseModeFavoriteBtn").classList.toggle("selected", isFavoriteMode);
  document.getElementById("verseFavoritePickerRow").hidden = !isFavoriteMode;
  select.value = state.settings.verseFavoriteVersion || "KJV";
}

function setupVerseVersionSettings() {
  document.getElementById("verseModeAlternateBtn").addEventListener("click", () => {
    state.settings.verseVersionMode = "alternate";
    saveState(state);
    renderVerseVersionSettings();
    renderToday();
  });
  document.getElementById("verseModeFavoriteBtn").addEventListener("click", () => {
    state.settings.verseVersionMode = "favorite";
    saveState(state);
    renderVerseVersionSettings();
    renderToday();
  });
  document.getElementById("verseFavoriteSelect").addEventListener("change", (e) => {
    state.settings.verseFavoriteVersion = e.target.value;
    saveState(state);
    renderToday();
  });
}

const APP_SHARE_URL = "https://arthurdongz.github.io/MyApp-Creation/";

function openMenu() {
  document.getElementById("menuShareMsg").hidden = true;
  document.getElementById("menuOverlay").hidden = false;
}

function closeMenu() {
  document.getElementById("menuOverlay").hidden = true;
}

function openAbout() {
  document.getElementById("aboutOverlay").hidden = false;
}

function closeAbout() {
  document.getElementById("aboutOverlay").hidden = true;
}

async function shareApp() {
  const shareData = {
    title: "Barnabas Journal",
    text: "I've been using Barnabas Journal — a daily verse, quote, and true story of encouragement. Thought you might like it too.",
    url: APP_SHARE_URL,
  };
  const msgEl = document.getElementById("menuShareMsg");
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (e) {
      // user cancelled the share sheet — nothing to do
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    msgEl.textContent = "Link copied to clipboard!";
  } catch (e) {
    msgEl.textContent = shareData.url;
  }
  msgEl.hidden = false;
}

// Points at whatever APK was most recently attached (under this exact
// filename) to any published GitHub Release — GitHub's own "latest" alias
// resolves this automatically, so this URL never needs to change as new
// builds are published. See mobile/README.md for the upload steps.
const ANDROID_APK_DOWNLOAD_URL =
  "https://github.com/Arthurdongz/MyApp-Creation/releases/latest/download/barnabas-journal.apk";
const ANDROID_DOWNLOAD_DISMISSED_KEY = "androidDownloadBannerDismissed";

function setupAndroidDownloadBanner() {
  const isAndroid = /Android/i.test(navigator.userAgent || "");
  const dismissed = localStorage.getItem(ANDROID_DOWNLOAD_DISMISSED_KEY) === "1";
  if (!isAndroid || dismissed) return;

  const banner = document.getElementById("androidDownloadBanner");
  const link = document.getElementById("androidDownloadLink");
  const dismissBtn = document.getElementById("androidDownloadDismiss");
  if (!banner || !link || !dismissBtn) return;

  link.href = ANDROID_APK_DOWNLOAD_URL;
  banner.hidden = false;

  dismissBtn.addEventListener("click", () => {
    banner.hidden = true;
    localStorage.setItem(ANDROID_DOWNLOAD_DISMISSED_KEY, "1");
  });
}

function setupMenu() {
  document.getElementById("menuBtn").addEventListener("click", openMenu);
  document.getElementById("menuCloseBtn").addEventListener("click", closeMenu);
  document.getElementById("menuOverlay").addEventListener("click", (e) => {
    if (e.target.id === "menuOverlay") closeMenu();
  });
  document.getElementById("menuSettingsBtn").addEventListener("click", () => {
    closeMenu();
    openSettings();
  });
  document.getElementById("menuAboutBtn").addEventListener("click", () => {
    closeMenu();
    openAbout();
  });
  document.getElementById("menuShareAppBtn").addEventListener("click", shareApp);
}

function setupAbout() {
  document.getElementById("aboutCloseBtn").addEventListener("click", closeAbout);
  document.getElementById("aboutOverlay").addEventListener("click", (e) => {
    if (e.target.id === "aboutOverlay") closeAbout();
  });
}

function setupBackup() {
  document.getElementById("exportBtn").addEventListener("click", exportData);
  const fileInput = document.getElementById("importFile");
  document.getElementById("importBtn").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      importDataFromFile(fileInput.files[0]);
    }
    fileInput.value = "";
  });
}

function setupOnboarding() {
  document.getElementById("onboardingStartBtn").addEventListener("click", completeOnboarding);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch(() => {
    // offline support is a nice-to-have — a failed registration shouldn't
    // block the app from working
  });
}

// sw.js serves stale-while-revalidate: a plain reload still gets the
// cached (possibly outdated) copy instantly, and only the NEXT load would
// pick up whatever the background revalidation just fetched — the same
// "needs two tries" problem expo-updates has on mobile, just caused by the
// cache instead of the OTA bundle. Clearing every cache first forces the
// reload itself to hit the network.
async function hardRefreshApp() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.update().catch(() => {})));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (e) {
    // best-effort — fall through to reload regardless
  }
  location.reload();
}

// Settings > Check for Updates, plus pulling down from the top of the
// screen — see hardRefreshApp() above for why a plain reload isn't enough
// on its own. Pull-to-refresh matters here specifically because an
// installed/standalone PWA often has no browser chrome left to supply the
// OS's native pull-to-refresh gesture.
function setupAppRefresh() {
  const btn = document.getElementById("refreshAppBtn");
  const msg = document.getElementById("refreshMsg");
  if (btn) {
    btn.addEventListener("click", () => {
      btn.disabled = true;
      if (msg) {
        msg.hidden = false;
        msg.textContent = "Refreshing…";
      }
      hardRefreshApp();
    });
  }

  const indicator = document.getElementById("pullRefreshIndicator");
  const indicatorText = document.getElementById("pullRefreshText");
  if (!indicator || !indicatorText) return;
  const PULL_THRESHOLD = 56;
  const MAX_PULL = 110;
  let startY = null;
  let pulling = false;
  let refreshing = false;

  document.addEventListener(
    "touchstart",
    (e) => {
      if (refreshing || window.scrollY > 0 || e.touches.length !== 1) {
        startY = null;
        return;
      }
      startY = e.touches[0].clientY;
      pulling = false;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (startY == null || refreshing) return;
      const delta = e.touches[0].clientY - startY;
      if (delta <= 0 || window.scrollY > 0) {
        pulling = false;
        indicator.style.transform = "";
        return;
      }
      pulling = true;
      const pull = Math.min(delta, MAX_PULL);
      indicator.style.transform = `translateY(${pull}px)`;
      const ready = pull >= PULL_THRESHOLD;
      indicator.classList.toggle("ready", ready);
      indicatorText.textContent = ready ? "↑ Release to refresh" : "↓ Pull to refresh";
    },
    { passive: true }
  );

  document.addEventListener("touchend", () => {
    if (!pulling || startY == null) {
      startY = null;
      return;
    }
    const wasReady = indicator.classList.contains("ready");
    pulling = false;
    startY = null;
    if (wasReady) {
      refreshing = true;
      indicator.classList.add("refreshing");
      indicator.style.transform = `translateY(${PULL_THRESHOLD}px)`;
      indicatorText.textContent = "Refreshing…";
      hardRefreshApp();
    } else {
      indicator.style.transform = "";
      indicator.classList.remove("ready");
    }
  });
}

function init() {
  applyTheme();
  setupAndroidDownloadBanner();
  setupTabs();
  setupDayNav();
  setupMoodPicker();
  setupMomentButton();
  setupMomentIntention();
  setupCustomMoment();
  setupWordReflect();
  setupStoryInsight();
  setupReflectAccordion();
  setupMomentFollowUp();
  setupMomentReflect();
  setupSaveReflection();
  setupFavoriteButtons();
  setupShareButtons();
  setupVersePopupAndBibleChapter();
  setupBibleBrowser();
  setupListenButtons();
  setupVoiceSettings();
  setupThemeToggle();
  setupSettings();
  setupVerseVersionSettings();
  setupMenu();
  setupAbout();
  setupSharePreview();
  setupBackup();
  setupOnboarding();
  setupSearch();
  setupAppRefresh();
  registerServiceWorker();
  initReflectAccordionForDay(ensureDayEntry(viewingDay));
  renderToday();
  renderStory();
  maybeShowOnboarding();
}

document.addEventListener("DOMContentLoaded", init);
