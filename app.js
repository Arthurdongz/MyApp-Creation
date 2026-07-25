// Barnabas Journal — app logic. Pure client-side, persisted to localStorage.

const STORAGE_KEY = "barnabasJournalState";

const BADGE_DEFS = [
  { id: "seed", icon: "🌱", name: "Seed of Encouragement", desc: "Earn 10 stars", type: "stars", threshold: 10 },
  { id: "growing", icon: "🌿", name: "Growing in Grace", desc: "Earn 50 stars", type: "stars", threshold: 50 },
  { id: "heart", icon: "💛", name: "Barnabas Heart", desc: "Earn 100 stars", type: "stars", threshold: 100 },
  { id: "son", icon: "🕊️", name: "Son of Encouragement", desc: "Earn 250 stars", type: "stars", threshold: 250 },
  { id: "steady", icon: "🕯️", name: "Steady Companion", desc: "3-day streak", type: "streak", threshold: 3 },
  { id: "week", icon: "☀️", name: "Week of Hope", desc: "7-day streak", type: "streak", threshold: 7 },
  { id: "faithful", icon: "🌟", name: "Faithful Encourager", desc: "30-day streak", type: "streak", threshold: 30 },
];

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { entries: {}, totalStars: 0 };
  try {
    const parsed = JSON.parse(raw);
    return { entries: parsed.entries || {}, totalStars: parsed.totalStars || 0 };
  } catch (e) {
    return { entries: {}, totalStars: 0 };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function ensureTodayEntry() {
  const key = todayKey();
  if (!state.entries[key]) {
    state.entries[key] = {
      mood: null,
      reflection: "",
      barnabasNote: "",
      momentDone: false,
      starsAwarded: { daily: false, moment: false, journal: false },
    };
  }
  // Backfill for entries saved before a field existed.
  const entry = state.entries[key];
  if (!entry.starsAwarded) entry.starsAwarded = { daily: false, moment: false, journal: false };
  return entry;
}

function awardStars(entry, field, amount) {
  if (entry.starsAwarded[field]) return;
  entry.starsAwarded[field] = true;
  state.totalStars += amount;
}

function computeStreak() {
  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const mm = String(cursor.getMonth() + 1).padStart(2, "0");
    const dd = String(cursor.getDate()).padStart(2, "0");
    const key = `${cursor.getFullYear()}-${mm}-${dd}`;
    const entry = state.entries[key];
    const hasActivity = entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (!hasActivity) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function countMomentsDone() {
  return Object.values(state.entries).filter((e) => e.momentDone).length;
}

// ---------- Rendering ----------

function renderToday() {
  const verse = pickForToday(VERSES);
  document.getElementById("verseText").textContent = `“${verse.text}”`;
  document.getElementById("verseRef").textContent = verse.ref;

  document.getElementById("encouragementText").textContent = pickForToday(ENCOURAGEMENTS);

  const wisdom = pickForToday(WISDOM);
  const titleEl = document.getElementById("wisdomTitle");
  const textEl = document.getElementById("wisdomText");
  const sourceEl = document.getElementById("wisdomSource");
  if (wisdom.type === "story") {
    titleEl.hidden = false;
    titleEl.textContent = wisdom.title;
    textEl.textContent = wisdom.text;
    sourceEl.textContent = "";
  } else {
    titleEl.hidden = true;
    textEl.textContent = `“${wisdom.text}”`;
    sourceEl.textContent = `— ${wisdom.source}`;
  }

  document.getElementById("momentText").textContent = pickForToday(BARNABAS_MOMENTS);

  const entry = ensureTodayEntry();
  awardStars(entry, "daily", 1);
  saveState(state);

  const momentBtn = document.getElementById("momentBtn");
  const momentMsg = document.getElementById("momentDoneMsg");
  if (entry.momentDone) {
    momentBtn.disabled = true;
    momentBtn.textContent = "Done today ✓";
    momentMsg.hidden = false;
  } else {
    momentBtn.disabled = false;
    momentBtn.textContent = "I did this today ✓";
    momentMsg.hidden = true;
  }

  document.getElementById("reflectionInput").value = entry.reflection || "";
  document.getElementById("barnabasInput").value = entry.barnabasNote || "";
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.mood === entry.mood);
  });

  renderHeaderStats();
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
    .sort((a, b) => (a < b ? 1 : -1));

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
        parts.push(`<div class="history-block"><div class="history-block-label">Barnabas Moment</div>Marked as done today.</div>`);
      }
      const mood = e.mood ? moodEmoji[e.mood] || "" : "";
      return `<div class="history-entry">
        <div class="history-date"><span>${formatDate(key)}</span><span class="history-mood">${mood}</span></div>
        ${parts.join("")}
      </div>`;
    })
    .join("");
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
      if (btn.dataset.tab === "history") renderHistory();
      if (btn.dataset.tab === "rewards") renderRewards();
    });
  });
}

function setupMoodPicker() {
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      const entry = ensureTodayEntry();
      entry.mood = btn.dataset.mood;
      saveState(state);
    });
  });
}

function setupMomentButton() {
  document.getElementById("momentBtn").addEventListener("click", () => {
    const entry = ensureTodayEntry();
    if (entry.momentDone) return;
    entry.momentDone = true;
    awardStars(entry, "moment", 2);
    saveState(state);
    renderToday();
  });
}

function setupSaveReflection() {
  document.getElementById("saveReflectionBtn").addEventListener("click", () => {
    const entry = ensureTodayEntry();
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

function init() {
  setupTabs();
  setupMoodPicker();
  setupMomentButton();
  setupSaveReflection();
  renderToday();
}

document.addEventListener("DOMContentLoaded", init);
