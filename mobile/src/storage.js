// Journal state, persistence (AsyncStorage), and rewards logic for
// Barnabas Journal. Mirrors the logic from the web version's app.js,
// adapted to React state + async storage.

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayKey } from "./content";

const STORAGE_KEY = "barnabasJournalState";

export const BADGE_DEFS = [
  { id: "seed", icon: "🌱", name: "Seed of Encouragement", desc: "Earn 10 stars", type: "stars", threshold: 10 },
  { id: "growing", icon: "🌿", name: "Growing in Grace", desc: "Earn 50 stars", type: "stars", threshold: 50 },
  { id: "heart", icon: "💛", name: "Barnabas Heart", desc: "Earn 100 stars", type: "stars", threshold: 100 },
  { id: "son", icon: "🕊️", name: "Son of Encouragement", desc: "Earn 250 stars", type: "stars", threshold: 250 },
  { id: "steady", icon: "🕯️", name: "Steady Companion", desc: "3-day streak", type: "streak", threshold: 3 },
  { id: "week", icon: "☀️", name: "Week of Hope", desc: "7-day streak", type: "streak", threshold: 7 },
  { id: "faithful", icon: "🌟", name: "Faithful Encourager", desc: "30-day streak", type: "streak", threshold: 30 },
];

const EMPTY_STATE = { entries: {}, totalStars: 0 };

function emptyEntry() {
  return {
    mood: null,
    reflection: "",
    barnabasNote: "",
    momentDone: false,
    starsAwarded: { daily: false, moment: false, journal: false },
  };
}

function withTodayEntry(state) {
  const key = todayKey();
  const existing = state.entries[key];
  const entry = existing ? { ...existing, starsAwarded: { ...existing.starsAwarded } } : emptyEntry();
  let totalStars = state.totalStars;
  if (!entry.starsAwarded.daily) {
    entry.starsAwarded.daily = true;
    totalStars += 1;
  }
  return {
    totalStars,
    entries: { ...state.entries, [key]: entry },
  };
}

export function computeStreak(entries) {
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const mm = String(cursor.getMonth() + 1).padStart(2, "0");
    const dd = String(cursor.getDate()).padStart(2, "0");
    const key = `${cursor.getFullYear()}-${mm}-${dd}`;
    const entry = entries[key];
    const hasActivity =
      entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (!hasActivity) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function countMomentsDone(entries) {
  return Object.values(entries).filter((e) => e.momentDone).length;
}

export function useJournalStore() {
  const [state, setState] = useState(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let loaded = EMPTY_STATE;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          loaded = { entries: parsed.entries || {}, totalStars: parsed.totalStars || 0 };
        }
      } catch (e) {
        loaded = EMPTY_STATE;
      }
      const withToday = withTodayEntry(loaded);
      setState(withToday);
      setReady(true);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withToday)).catch(() => {});
    })();
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateTodayEntry = useCallback(
    (updater) => {
      setState((prev) => {
        const key = todayKey();
        const current = prev.entries[key] || emptyEntry();
        const { entry: nextEntry, starsGained } = updater({
          ...current,
          starsAwarded: { ...current.starsAwarded },
        });
        const next = {
          totalStars: prev.totalStars + (starsGained || 0),
          entries: { ...prev.entries, [key]: nextEntry },
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const setMood = useCallback(
    (mood) => {
      updateTodayEntry((entry) => ({ entry: { ...entry, mood }, starsGained: 0 }));
    },
    [updateTodayEntry]
  );

  const markMomentDone = useCallback(() => {
    updateTodayEntry((entry) => {
      if (entry.momentDone) return { entry, starsGained: 0 };
      const starsGained = entry.starsAwarded.moment ? 0 : 2;
      return {
        entry: {
          ...entry,
          momentDone: true,
          starsAwarded: { ...entry.starsAwarded, moment: true },
        },
        starsGained,
      };
    });
  }, [updateTodayEntry]);

  const saveReflection = useCallback(
    (reflection, barnabasNote) => {
      updateTodayEntry((entry) => {
        const trimmedReflection = reflection.trim();
        const trimmedNote = barnabasNote.trim();
        const hasContent = trimmedReflection || trimmedNote;
        const alreadyAwarded = entry.starsAwarded.journal;
        const starsGained = hasContent && !alreadyAwarded ? 2 : 0;
        return {
          entry: {
            ...entry,
            reflection: trimmedReflection,
            barnabasNote: trimmedNote,
            starsAwarded: {
              ...entry.starsAwarded,
              journal: alreadyAwarded || Boolean(hasContent),
            },
          },
          starsGained,
        };
      });
    },
    [updateTodayEntry]
  );

  const today = state.entries[todayKey()] || emptyEntry();
  const streak = computeStreak(state.entries);
  const momentsDone = countMomentsDone(state.entries);

  return {
    ready,
    state,
    today,
    streak,
    momentsDone,
    totalStars: state.totalStars,
    setMood,
    markMomentDone,
    saveReflection,
  };
}
