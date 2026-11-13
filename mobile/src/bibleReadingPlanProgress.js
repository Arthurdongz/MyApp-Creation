// Progress tracking for Bible reading plans (the "Whole Bible in a Year"
// plan and the topical "Barnabas Heart" mini-plans) — separate from the
// main journal store and from bibleHighlights.js, since a reading plan's
// day-completion state has nothing to do with either. Mirrors
// bibleHighlights.js's shape: one flat AsyncStorage-backed object, loaded
// once, mutated through pure functions that immediately persist.
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "barnabas.bibleReadingPlanProgress.v1";

// { plans: { "<planId>": { startedAt: "YYYY-MM-DD", completedDays: [1, 2, 5], lastOpenedDay: 5 } } }
// lastOpenedDay is independent of completedDays — it tracks whichever day's
// scripture was most recently opened in the reader (see
// BibleReadingPlansScreen.js's openYearDay/openTopicalDay/
// openCrossRefPassage), so the list screen's highlight follows wherever a
// reader actually left off, not just the first not-yet-checked-off day.
// Persisted the same as everything else here, so it survives closing the
// app for any length of time, and tracked per plan, so reading several
// plans in the same week doesn't make them fight over one shared marker.
function emptyState() {
  return { plans: {} };
}

// Serializes every write onto one promise chain, same reasoning as
// bibleHighlights.js: rapid taps marking several days in a row can't race
// and leave a stale object persisted.
let queue = Promise.resolve();
function withQueue(fn) {
  const next = queue.catch(() => {}).then(fn);
  queue = next;
  return next;
}

export async function loadReadingPlanProgress() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && parsed.plans ? parsed : emptyState();
  } catch (e) {
    return emptyState();
  }
}

function persist(state) {
  return withQueue(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {}));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getPlanProgress(state, planId) {
  return state.plans[planId] || null;
}

// Marks a plan as started (first time only) so its card can show "Day 1 of
// N" instead of a bare "Start" prompt, without requiring a day to already
// be marked complete.
export function startPlan(state, planId) {
  if (state.plans[planId]) return state;
  const next = {
    ...state,
    plans: { ...state.plans, [planId]: { startedAt: todayKey(), completedDays: [], lastOpenedDay: null } },
  };
  persist(next);
  return next;
}

// Records whichever day's scripture a reader most recently opened — called
// every time the reader opens, regardless of whether that day ever gets
// marked complete, so it tracks "where did I actually last read," not
// "where's the first checkbox left unchecked." Always overwrites (unlike
// markDayComplete's includes-check), since re-opening an already-read day
// is still the most recent thing read.
export function markDayOpened(state, planId, day) {
  const existing = state.plans[planId] || { startedAt: todayKey(), completedDays: [] };
  if (existing.lastOpenedDay === day) return state;
  const next = { ...state, plans: { ...state.plans, [planId]: { ...existing, lastOpenedDay: day } } };
  persist(next);
  return next;
}

export function markDayComplete(state, planId, day) {
  const existing = state.plans[planId] || { startedAt: todayKey(), completedDays: [] };
  if (existing.completedDays.includes(day)) return state;
  const next = {
    ...state,
    plans: { ...state.plans, [planId]: { ...existing, completedDays: [...existing.completedDays, day].sort((a, b) => a - b) } },
  };
  persist(next);
  return next;
}

export function markDayIncomplete(state, planId, day) {
  const existing = state.plans[planId];
  if (!existing || !existing.completedDays.includes(day)) return state;
  const next = {
    ...state,
    plans: { ...state.plans, [planId]: { ...existing, completedDays: existing.completedDays.filter((d) => d !== day) } },
  };
  persist(next);
  return next;
}

// Removes all progress for a plan, so a reader can restart it from day 1.
export function resetPlan(state, planId) {
  if (!state.plans[planId]) return state;
  const { [planId]: _removed, ...rest } = state.plans;
  const next = { ...state, plans: rest };
  persist(next);
  return next;
}
