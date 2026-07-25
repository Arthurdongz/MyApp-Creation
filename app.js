// Barnabas Journal — app logic. Pure client-side, persisted to localStorage.
//
// Content is organized around a per-user "journey day" number (1..366),
// not the calendar day-of-year: each user gets their own shuffled order of
// the 366 content slots on first use, and a new day unlocks once per real
// calendar day since then. Users can navigate back through days they've
// already reached, but not ahead of the current unlocked day.

const STORAGE_KEY = "barnabasJournalStateV2";

const BADGE_DEFS = [
  { id: "seed", icon: "🌱", name: "Seed of Encouragement", desc: "Earn 10 stars", type: "stars", threshold: 10 },
  { id: "growing", icon: "🌿", name: "Growing in Grace", desc: "Earn 50 stars", type: "stars", threshold: 50 },
  { id: "heart", icon: "💛", name: "Barnabas Heart", desc: "Earn 100 stars", type: "stars", threshold: 100 },
  { id: "son", icon: "🕊️", name: "Son of Encouragement", desc: "Earn 250 stars", type: "stars", threshold: 250 },
  { id: "steady", icon: "🕯️", name: "Steady Companion", desc: "3-day streak", type: "streak", threshold: 3 },
  { id: "week", icon: "☀️", name: "Week of Hope", desc: "7-day streak", type: "streak", threshold: 7 },
  { id: "faithful", icon: "🌟", name: "Faithful Encourager", desc: "30-day streak", type: "streak", threshold: 30 },
];

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

function computeStreak() {
  let streak = 0;
  for (let n = unlockedDay(); n >= 1; n--) {
    const entry = state.entries[`day-${n}`];
    const hasActivity = entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (!hasActivity) break;
    streak += 1;
  }
  return streak;
}

function countMomentsDone() {
  return Object.values(state.entries).filter((e) => e.momentDone).length;
}

// ---------- Rendering ----------

function renderToday() {
  const day = viewingDay;
  const isToday = day === unlockedDay();

  const verse = pickForDay(VERSES, day, state.order);
  document.getElementById("verseText").textContent = `“${verse.text}”`;
  document.getElementById("verseRef").textContent = verse.ref;

  document.getElementById("encouragementText").textContent = pickForDay(ENCOURAGEMENTS, day, state.order);

  const wisdom = pickForDay(WISDOM, day, state.order);
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

function setupDayNav() {
  document.getElementById("dayNavPrev").addEventListener("click", () => {
    if (viewingDay > 1) {
      viewingDay -= 1;
      renderToday();
    }
  });
  document.getElementById("dayNavNext").addEventListener("click", () => {
    if (viewingDay < unlockedDay()) {
      viewingDay += 1;
      renderToday();
    }
  });
  document.getElementById("dayNavJump").addEventListener("click", () => {
    viewingDay = unlockedDay();
    renderToday();
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

function init() {
  setupTabs();
  setupDayNav();
  setupMoodPicker();
  setupMomentButton();
  setupSaveReflection();
  renderToday();
}

document.addEventListener("DOMContentLoaded", init);
