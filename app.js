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

// Background gradients offered for shared quote/verse/story images — each
// pulled straight from the app's own palette (sage, gold, sky, the card
// accent colors) so every option still feels like Barnabas Journal, rather
// than an arbitrary color picker.
const SHARE_THEMES = [
  { id: "classic", name: "Classic", colors: ["#f7dca3", "#6f9578"] },
  { id: "sage", name: "Sage", colors: ["#eef4ea", "#56705f"] },
  { id: "sky", name: "Sky", colors: ["#cfe3ec", "#7c9885"] },
  { id: "story", name: "Story", colors: ["#f7dca3", "#8fae97"] },
  { id: "warm", name: "Warm", colors: ["#fbe4d8", "#e0ab3c"] },
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
  return { onboarded: false, theme: "system", shareTheme: "classic" };
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

function ensureDayEntry(dayNumber) {
  const key = `day-${dayNumber}`;
  if (!state.entries[key]) {
    state.entries[key] = {
      dayNumber,
      dateLogged: todayDateKey(),
      mood: null,
      reflection: "",
      barnabasNote: "",
      momentDone: false,
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

// One missed day per 7-day window can be "graced" — it bridges the streak
// without breaking it, but doesn't itself count toward the streak number.
function weekBucket(dayNumber) {
  return Math.floor((dayNumber - 1) / 7);
}

function computeStreak() {
  let streak = 0;
  const graceUsed = new Set();
  let n = unlockedDay();
  while (n >= 1) {
    const entry = state.entries[`day-${n}`];
    const hasActivity = entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (hasActivity) {
      streak += 1;
      n -= 1;
      continue;
    }
    const week = weekBucket(n);
    if (!graceUsed.has(week)) {
      graceUsed.add(week);
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
      renderToday();
      renderStory();
      renderHistory();
      renderOnThisDay();
      renderRewards();
      renderMoodCalendar();
      renderFavorites();
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

async function shareVerse(day) {
  const verse = pickForDay(VERSES, day, state.order);
  const canvas = renderQuoteCardCanvas(verse.text, verse.ref);
  const blob = await canvasToBlob(canvas);
  const result = await shareOrDownloadImage(
    blob,
    `barnabas-journal-verse-day${day}.png`,
    "Barnabas Journal",
    `${verse.text} — ${verse.ref}`
  );
  showShareMsg("verseShareMsg", result);
  return result;
}

async function shareWisdom(day) {
  const quote = pickForDaySmallBank(QUOTES, day, state.order);
  const canvas = renderQuoteCardCanvas(quote.text, `— ${quote.source || ""}`);
  const blob = await canvasToBlob(canvas);
  const result = await shareOrDownloadImage(
    blob,
    `barnabas-journal-quote-day${day}.png`,
    "Barnabas Journal",
    quote.text
  );
  showShareMsg("wisdomShareMsg", result);
}

async function shareStory(day) {
  const story = pickForDaySmallBank(STORIES, day, state.order);
  const canvas = renderQuoteCardCanvas(story.text, story.title);
  const blob = await canvasToBlob(canvas);
  const result = await shareOrDownloadImage(
    blob,
    `barnabas-journal-story-day${day}.png`,
    "Barnabas Journal",
    `${story.title} — ${story.text}`
  );
  showShareMsg("storyShareMsg", result);
}

async function shareMoment(day) {
  const moment = pickForDay(BARNABAS_MOMENTS, day, state.order);
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

  const verse = pickForDay(VERSES, day, state.order);
  document.getElementById("verseText").textContent = `“${verse.text}”`;
  document.getElementById("verseRef").textContent = verse.ref;
  updateFavoriteBtn("verseFavoriteBtn", "verse", day);

  document.getElementById("encouragementText").textContent = pickForDay(ENCOURAGEMENTS, day, state.order);

  const quote = pickForDaySmallBank(QUOTES, day, state.order);
  document.getElementById("wisdomText").textContent = `“${quote.text}”`;
  document.getElementById("wisdomSource").textContent = `— ${quote.source}`;
  updateFavoriteBtn("wisdomFavoriteBtn", "wisdom", day);

  document.getElementById("momentText").textContent = pickForDay(BARNABAS_MOMENTS, day, state.order);

  const entry = ensureDayEntry(day);
  awardStars(entry, "daily", 1);
  saveState(state);

  const momentBtn = document.getElementById("momentBtn");
  const momentMsg = document.getElementById("momentDoneMsg");
  if (entry.momentDone) {
    momentBtn.disabled = true;
    momentBtn.textContent = "Done ✓";
    momentMsg.hidden = false;
  } else {
    momentBtn.disabled = false;
    momentBtn.textContent = isToday ? "I did this today ✓" : "I did this ✓";
    momentMsg.hidden = true;
  }

  document.getElementById("reflectionInput").value = entry.reflection || "";
  document.getElementById("barnabasInput").value = entry.barnabasNote || "";
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
  updateFavoriteBtn("storyFavoriteBtn", "truestory", day);
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
  const keys = Object.keys(state.entries)
    .filter((k) => {
      const e = state.entries[k];
      return e.reflection || e.barnabasNote || e.momentDone;
    })
    .sort((a, b) => state.entries[b].dayNumber - state.entries[a].dayNumber);

  if (keys.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

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
  if (f.type === "truestory") return "True Story";
  if (f.type === "wisdom" && f.title) return "Story";
  return "Quote";
}

function favoriteSourceLine(f) {
  if (f.type === "verse") return f.ref;
  if (f.type === "truestory") return f.title;
  if (f.type === "wisdom" && f.title) return f.title;
  return `— ${f.source || ""}`;
}

function renderFavorites() {
  const list = document.getElementById("favoritesList");
  const empty = document.getElementById("favoritesEmpty");
  const favorites = state.favorites.slice().sort((a, b) => b.dayNumber - a.dayNumber);

  if (favorites.length === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

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

function renderShareThemePicker() {
  const picker = document.getElementById("shareThemePicker");
  picker.innerHTML = SHARE_THEMES
    .map((t) => {
      const selected = state.settings.shareTheme === t.id;
      return `<button type="button" class="share-theme-swatch${selected ? " selected" : ""}" data-theme="${t.id}" title="${t.name}" style="background: linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})"></button>`;
    })
    .join("");
  picker.querySelectorAll(".share-theme-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.shareTheme = btn.dataset.theme;
      saveState(state);
      renderShareThemePicker();
    });
  });
}

function renderRewards() {
  document.getElementById("rewardStars").textContent = state.totalStars;
  document.getElementById("rewardStreak").textContent = computeStreak();
  document.getElementById("rewardMoments").textContent = countMomentsDone();

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
    const snippet = entry && (entry.reflection || entry.barnabasNote);
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

function setupDayNav() {
  document.getElementById("dayNavPrev").addEventListener("click", () => {
    if (viewingDay > 1) {
      viewingDay -= 1;
      renderToday();
      renderStory();
    }
  });
  document.getElementById("dayNavNext").addEventListener("click", () => {
    if (viewingDay < unlockedDay()) {
      viewingDay += 1;
      renderToday();
      renderStory();
    }
  });
  document.getElementById("dayNavJump").addEventListener("click", () => {
    viewingDay = unlockedDay();
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

function setupSaveReflection() {
  document.getElementById("saveReflectionBtn").addEventListener("click", () => {
    const entry = ensureDayEntry(viewingDay);
    entry.reflection = document.getElementById("reflectionInput").value.trim();
    entry.barnabasNote = document.getElementById("barnabasInput").value.trim();
    if (entry.reflection || entry.barnabasNote) {
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
    const verse = pickForDay(VERSES, viewingDay, state.order);
    toggleFavorite("verse", viewingDay, { text: verse.text, ref: verse.ref });
    updateFavoriteBtn("verseFavoriteBtn", "verse", viewingDay);
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
    shareVerse(viewingDay);
  });
  document.getElementById("wisdomShareBtn").addEventListener("click", () => {
    shareWisdom(viewingDay);
  });
  document.getElementById("storyShareBtn").addEventListener("click", () => {
    shareStory(viewingDay);
  });
  document.getElementById("momentShareBtn").addEventListener("click", () => {
    shareMoment(viewingDay);
  });
  document.getElementById("reachOutBtn").addEventListener("click", reachOut);
}

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function setupListenButtons() {
  const ids = ["verseListenBtn", "encouragementListenBtn", "storyListenBtn"];
  if (!window.speechSynthesis) {
    ids.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.hidden = true;
    });
    return;
  }
  document.getElementById("verseListenBtn").addEventListener("click", () => {
    const verse = pickForDay(VERSES, viewingDay, state.order);
    speak(`${verse.text} — ${verse.ref}`);
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
  renderShareThemePicker();
  document.getElementById("settingsOverlay").hidden = false;
}

function closeSettings() {
  document.getElementById("settingsOverlay").hidden = true;
}

function setupSettings() {
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettings);
  document.getElementById("settingsOverlay").addEventListener("click", (e) => {
    if (e.target.id === "settingsOverlay") closeSettings();
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

function init() {
  applyTheme();
  setupTabs();
  setupDayNav();
  setupMoodPicker();
  setupMomentButton();
  setupSaveReflection();
  setupFavoriteButtons();
  setupShareButtons();
  setupListenButtons();
  setupThemeToggle();
  setupSettings();
  setupBackup();
  setupOnboarding();
  renderToday();
  renderStory();
  maybeShowOnboarding();
}

document.addEventListener("DOMContentLoaded", init);
