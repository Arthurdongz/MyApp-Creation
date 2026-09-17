// Progress tracking for Bible reading plans (the "Whole Bible in a Year"
// plan and the topical "Barnabas Heart" mini-plans) — separate from the
// main journal store and from bibleHighlights.js, since a reading plan's
// day-completion state has nothing to do with either. Mirrors
// bibleHighlights.js's shape: one flat AsyncStorage-backed object, loaded
// once, mutated through pure functions that immediately persist.
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "barnabas.bibleReadingPlanProgress.v1";

// { plans: { "<planId>": { startedAt: "YYYY-MM-DD", completedDays: [1, 2, 5] } } }
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
  const next = { ...state, plans: { ...state.plans, [planId]: { startedAt: todayKey(), completedDays: [] } } };
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
