// Journal state, persistence (AsyncStorage), and rewards logic for
// Barnabas Journal. Content is organized around a per-user "journey day"
// number (1..366), not the calendar day-of-year: each user gets their own
// shuffled order of the 366 content slots on first use, and a new day
// unlocks once per real calendar day since then.

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { todayKey, shuffledOrder, unlockedDayFor, TOTAL_DAYS } from "./content";

const STORAGE_KEY = "barnabasJournalStateV2";

export const BADGE_DEFS = [
  { id: "seed", icon: "🌱", name: "Seed of Encouragement", desc: "Earn 10 stars", type: "stars", threshold: 10 },
  { id: "growing", icon: "🌿", name: "Growing in Grace", desc: "Earn 50 stars", type: "stars", threshold: 50 },
  { id: "heart", icon: "💛", name: "Barnabas Heart", desc: "Earn 100 stars", type: "stars", threshold: 100 },
  { id: "son", icon: "🕊️", name: "Son of Encouragement", desc: "Earn 250 stars", type: "stars", threshold: 250 },
  { id: "steady", icon: "🕯️", name: "Steady Companion", desc: "3-day streak", type: "streak", threshold: 3 },
  { id: "week", icon: "☀️", name: "Week of Hope", desc: "7-day streak", type: "streak", threshold: 7 },
  { id: "faithful", icon: "🌟", name: "Faithful Encourager", desc: "30-day streak", type: "streak", threshold: 30 },
];

function freshJourney() {
  return {
    journeyStartDate: todayKey(),
    order: shuffledOrder(TOTAL_DAYS),
    entries: {},
    totalStars: 0,
  };
}

function emptyEntry(dayNumber) {
  return {
    dayNumber,
    dateLogged: todayKey(),
    mood: null,
    reflection: "",
    barnabasNote: "",
    momentDone: false,
    starsAwarded: { daily: false, moment: false, journal: false },
  };
}

export function computeStreak(entries, latestDay) {
  let streak = 0;
  for (let n = latestDay; n >= 1; n--) {
    const entry = entries[`day-${n}`];
    const hasActivity =
      entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (!hasActivity) break;
    streak += 1;
  }
  return streak;
}

export function countMomentsDone(entries) {
  return Object.values(entries).filter((e) => e.momentDone).length;
}

function ensureDayEntryWithStar(state, dayNumber) {
  const key = `day-${dayNumber}`;
  const existing = state.entries[key];
  const entry = existing
    ? { ...existing, starsAwarded: { ...existing.starsAwarded } }
    : emptyEntry(dayNumber);
  let totalStars = state.totalStars;
  if (!entry.starsAwarded.daily) {
    entry.starsAwarded.daily = true;
    totalStars += 1;
  }
  return {
    ...state,
    totalStars,
    entries: { ...state.entries, [key]: entry },
  };
}

export function useJournalStore() {
  const [state, setState] = useState(freshJourney());
  const [ready, setReady] = useState(false);
  const [viewingDay, setViewingDay] = useState(1);

  useEffect(() => {
    (async () => {
      let loaded = freshJourney();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.journeyStartDate && Array.isArray(parsed.order)) {
            loaded = {
              journeyStartDate: parsed.journeyStartDate,
              order: parsed.order,
              entries: parsed.entries || {},
              totalStars: parsed.totalStars || 0,
            };
          }
        }
      } catch (e) {
        loaded = freshJourney();
      }
      setState(loaded);
      setViewingDay(unlockedDayFor(loaded.journeyStartDate));
      setReady(true);
    })();
  }, []);

  const latestDay = unlockedDayFor(state.journeyStartDate);

  // Whenever the viewed day changes (including right after load), make sure
  // that day's entry exists and has received its "showing up" star. This
  // covers both today's content and catching up on a previously unvisited
  // day the user has navigated back or forward to.
  useEffect(() => {
    if (!ready) return;
    setState((prev) => {
      const next = ensureDayEntryWithStar(prev, viewingDay);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingDay, ready]);

  const goToPrevDay = useCallback(() => {
    setViewingDay((d) => Math.max(1, d - 1));
  }, []);

  const goToNextDay = useCallback(() => {
    setViewingDay((d) => Math.min(latestDay, d + 1));
  }, [latestDay]);

  const jumpToToday = useCallback(() => {
    setViewingDay(latestDay);
  }, [latestDay]);

  const updateViewedEntry = useCallback(
    (updater) => {
      setState((prev) => {
        const key = `day-${viewingDay}`;
        const current = prev.entries[key] || emptyEntry(viewingDay);
        const { entry: nextEntry, starsGained } = updater({
          ...current,
          starsAwarded: { ...current.starsAwarded },
        });
        const next = {
          ...prev,
          totalStars: prev.totalStars + (starsGained || 0),
          entries: { ...prev.entries, [key]: nextEntry },
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [viewingDay]
  );

  const setMood = useCallback(
    (mood) => {
      updateViewedEntry((entry) => ({ entry: { ...entry, mood }, starsGained: 0 }));
    },
    [updateViewedEntry]
  );

  const markMomentDone = useCallback(() => {
    updateViewedEntry((entry) => {
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
  }, [updateViewedEntry]);

  const saveReflection = useCallback(
    (reflection, barnabasNote) => {
      updateViewedEntry((entry) => {
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
    [updateViewedEntry]
  );

  const viewedEntry = state.entries[`day-${viewingDay}`] || emptyEntry(viewingDay);
  const streak = computeStreak(state.entries, latestDay);
  const momentsDone = countMomentsDone(state.entries);

  return {
    ready,
    state,
    order: state.order,
    viewingDay,
    latestDay,
    isToday: viewingDay === latestDay,
    today: viewedEntry,
    streak,
    momentsDone,
    totalStars: state.totalStars,
    goToPrevDay,
    goToNextDay,
    jumpToToday,
    setMood,
    markMomentDone,
    saveReflection,
  };
}
