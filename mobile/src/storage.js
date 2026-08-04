// Journal state, persistence (AsyncStorage), and rewards logic for
// Barnabas Journal. Content is organized around a per-user "journey day"
// number (1..366), not the calendar day-of-year: each user gets their own
// shuffled order of the 366 content slots on first use, and a new day
// unlocks once per real calendar day since then.

import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { todayKey, shuffledOrder, unlockedDayFor, dateKeyForDayNumber, TOTAL_DAYS } from "./content";
import {
  requestNotificationPermission,
  scheduleMorningReminder,
  scheduleHighlightReminder,
  scheduleEveningReminder,
} from "./notifications";

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

function defaultSettings() {
  return {
    onboarded: false,
    theme: "system",
    shareTheme: "classic",
    morningReminderEnabled: false,
    morningReminderHour: 8,
    morningReminderMinute: 0,
    highlightReminderEnabled: false,
    highlightReminderHour: 13,
    highlightReminderMinute: 0,
    eveningReminderEnabled: false,
    eveningReminderHour: 20,
    eveningReminderMinute: 0,
    speechVoiceURI: "",
    speechPitch: 1,
    speechRate: 0.95,
    lastCrisisNudgeShownAt: null,
    lastCheckInNudgeShownAt: null,
    verseVersionMode: "alternate",
    verseFavoriteVersion: "KJV",
    reviewPromptShownAt: null,
  };
}

function freshJourney() {
  return {
    journeyStartDate: todayKey(),
    order: shuffledOrder(TOTAL_DAYS),
    entries: {},
    totalStars: 0,
    favorites: [],
    settings: defaultSettings(),
  };
}

function emptyEntry(dayNumber, journeyStartDate) {
  return {
    dayNumber,
    dateLogged: journeyStartDate ? dateKeyForDayNumber(journeyStartDate, dayNumber) : todayKey(),
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

// Before reminders became twice-a-day, settings stored a single
// reminderEnabled/reminderHour/reminderMinute. Carry that forward as the
// morning reminder so existing users keep the time they already chose,
// rather than losing it silently; evening stays off until they opt in.
function migrateSettings(rawSettings) {
  const migrated = { ...rawSettings };
  if (migrated.morningReminderEnabled === undefined && rawSettings.reminderEnabled !== undefined) {
    migrated.morningReminderEnabled = rawSettings.reminderEnabled;
    migrated.morningReminderHour = rawSettings.reminderHour;
    migrated.morningReminderMinute = rawSettings.reminderMinute;
  }
  return migrated;
}

function normalizeLoaded(parsed) {
  return {
    journeyStartDate: parsed.journeyStartDate,
    order: parsed.order,
    entries: parsed.entries || {},
    totalStars: parsed.totalStars || 0,
    favorites: parsed.favorites || [],
    settings: { ...defaultSettings(), ...migrateSettings(parsed.settings || {}) },
  };
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
export function computeStreak(entries, latestDay) {
  let streak = 0;
  let lastGraceDay = null;
  let n = latestDay;
  while (n >= 1) {
    const entry = entries[`day-${n}`];
    const hasActivity =
      entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
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

export function countMomentsDone(entries) {
  return Object.values(entries).filter((e) => e.momentDone).length;
}

function daysSinceKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const from = new Date(y, m - 1, d);
  const to = new Date();
  to.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  return Math.round((to - from) / 86400000);
}

// A gentle, rate-limited nudge toward real crisis resources when someone's
// logged mood has been "struggling" often over the last week. Shown at most
// once every 14 days even if the pattern continues, so it never feels like
// nagging — "days > 0" lets it stay visible for the rest of the day it's
// first triggered on, since that's the same day lastShownAt gets set to.
function countStrugglingDays(entries, latestDay) {
  const start = Math.max(1, latestDay - 6);
  let strugglingCount = 0;
  for (let day = start; day <= latestDay; day++) {
    const entry = entries[`day-${day}`];
    if (entry && entry.mood === "struggling") strugglingCount += 1;
  }
  return strugglingCount;
}

function computeShowCrisisNudge(entries, latestDay, lastShownAt) {
  if (lastShownAt) {
    const days = daysSinceKey(lastShownAt);
    if (days > 0 && days < 14) return false;
  }
  return countStrugglingDays(entries, latestDay) >= 3;
}

// A softer companion to the crisis nudge — fires on a lighter, earlier
// signal (2 struggling days in the last week rather than 3+), offering
// human connection or a reflective pause instead of crisis resources.
// Suppressed whenever the crisis nudge itself is showing, so the two never
// stack into two heavy cards at once.
function computeShowCheckInNudge(entries, latestDay, lastShownAt, showCrisisNudge) {
  if (showCrisisNudge) return false;
  if (lastShownAt) {
    const days = daysSinceKey(lastShownAt);
    if (days > 0 && days < 14) return false;
  }
  return countStrugglingDays(entries, latestDay) >= 2;
}

// A quick look back at the last 7 journey days (or fewer, near the very
// start of a journey) — how many days had any activity, how many Barnabas
// Moments got done, and how many journal entries got written.
export function computeWeeklyRecap(entries, latestDay) {
  const start = Math.max(1, latestDay - 6);
  let daysShownUp = 0;
  let momentsDone = 0;
  let journalEntries = 0;
  let kindnessReceived = 0;
  for (let day = start; day <= latestDay; day++) {
    const entry = entries[`day-${day}`];
    if (!entry) continue;
    if (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal) {
      daysShownUp += 1;
    }
    if (entry.momentDone) momentsDone += 1;
    if (entry.reflection || entry.barnabasNote) journalEntries += 1;
    if (entry.receivedKindness) kindnessReceived += 1;
  }
  return { daysShownUp, momentsDone, journalEntries, kindnessReceived, totalDays: latestDay - start + 1 };
}

function ensureDayEntryWithStar(state, dayNumber) {
  const key = `day-${dayNumber}`;
  const existing = state.entries[key];
  const entry = existing
    ? { ...existing, starsAwarded: { ...existing.starsAwarded } }
    : emptyEntry(dayNumber, state.journeyStartDate);
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

function favoriteId(type, dayNumber) {
  return `${type}-${dayNumber}`;
}

export function useJournalStore() {
  const [state, setState] = useState(freshJourney());
  const [ready, setReady] = useState(false);
  const [viewingDay, setViewingDay] = useState(1);

  const persist = useCallback((next) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      let loaded = freshJourney();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.journeyStartDate && Array.isArray(parsed.order)) {
            loaded = normalizeLoaded(parsed);
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

  // "Top up" both rolling notification schedules once per app launch, so
  // the reminders keep showing fresh, content-matched days even if the user
  // hasn't opened the app in a while (as long as it's within the lookahead
  // window notifications.js schedules).
  useEffect(() => {
    if (!ready) return;
    if (state.settings.morningReminderEnabled) {
      scheduleMorningReminder(
        state.settings.morningReminderHour,
        state.settings.morningReminderMinute,
        state.journeyStartDate,
        state.order
      );
    }
    if (state.settings.highlightReminderEnabled) {
      scheduleHighlightReminder(
        state.settings.highlightReminderHour,
        state.settings.highlightReminderMinute,
        state.journeyStartDate,
        state.order
      );
    }
    if (state.settings.eveningReminderEnabled) {
      scheduleEveningReminder(state.settings.eveningReminderHour, state.settings.eveningReminderMinute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Whenever the viewed day changes (including right after load), make sure
  // that day's entry exists and has received its "showing up" star. This
  // covers both today's content and catching up on a previously unvisited
  // day the user has navigated back or forward to.
  useEffect(() => {
    if (!ready) return;
    setState((prev) => {
      const next = ensureDayEntryWithStar(prev, viewingDay);
      persist(next);
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
        const current = prev.entries[key] || emptyEntry(viewingDay, prev.journeyStartDate);
        const { entry: nextEntry, starsGained } = updater({
          ...current,
          starsAwarded: { ...current.starsAwarded },
        });
        const next = {
          ...prev,
          totalStars: prev.totalStars + (starsGained || 0),
          entries: { ...prev.entries, [key]: nextEntry },
        };
        persist(next);
        return next;
      });
    },
    [viewingDay, persist]
  );

  const setMood = useCallback(
    (mood) => {
      updateViewedEntry((entry) => ({ entry: { ...entry, mood }, starsGained: 0 }));
    },
    [updateViewedEntry]
  );

  const setMomentIntention = useCallback(
    (momentIntention) => {
      updateViewedEntry((entry) => ({ entry: { ...entry, momentIntention }, starsGained: 0 }));
    },
    [updateViewedEntry]
  );

  const setCustomMoment = useCallback(
    (text) => {
      const customMoment = text.trim() || null;
      updateViewedEntry((entry) => ({ entry: { ...entry, customMoment }, starsGained: 0 }));
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

  // Answers the "did you get to it?" follow-up for a day other than the one
  // currently being viewed (always the previous day) — separate from
  // updateViewedEntry, which only ever touches viewingDay.
  const answerMomentFollowUp = useCallback(
    (dayNumber, status) => {
      setState((prev) => {
        const key = `day-${dayNumber}`;
        const existing = prev.entries[key] || emptyEntry(dayNumber, prev.journeyStartDate);
        const entry = { ...existing, starsAwarded: { ...existing.starsAwarded } };
        entry.momentFollowUpAsked = true;
        entry.momentFollowUpStatus = status;
        let starsGained = 0;
        if (status === "done" && !entry.momentDone) {
          entry.momentDone = true;
          if (!entry.starsAwarded.moment) {
            entry.starsAwarded.moment = true;
            starsGained = 2;
          }
        }
        const next = {
          ...prev,
          totalStars: prev.totalStars + starsGained,
          entries: { ...prev.entries, [key]: entry },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const saveReflection = useCallback(
    (reflection, barnabasNote, receivedKindness) => {
      updateViewedEntry((entry) => {
        const trimmedReflection = reflection.trim();
        const trimmedNote = barnabasNote.trim();
        const trimmedReceived = (receivedKindness || "").trim();
        const hasContent = trimmedReflection || trimmedNote || trimmedReceived;
        const alreadyAwarded = entry.starsAwarded.journal;
        const starsGained = hasContent && !alreadyAwarded ? 2 : 0;
        return {
          entry: {
            ...entry,
            reflection: trimmedReflection,
            barnabasNote: trimmedNote,
            receivedKindness: trimmedReceived,
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

  const isFavorited = useCallback(
    (type, dayNumber) => state.favorites.some((f) => f.id === favoriteId(type, dayNumber)),
    [state.favorites]
  );

  const toggleFavorite = useCallback(
    (type, dayNumber, payload) => {
      setState((prev) => {
        const id = favoriteId(type, dayNumber);
        const exists = prev.favorites.some((f) => f.id === id);
        const favorites = exists
          ? prev.favorites.filter((f) => f.id !== id)
          : [...prev.favorites, { id, type, dayNumber, savedAt: todayKey(), ...payload }];
        const next = { ...prev, favorites };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeFavorite = useCallback(
    (id) => {
      setState((prev) => {
        const next = { ...prev, favorites: prev.favorites.filter((f) => f.id !== id) };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateSettings = useCallback(
    (patch) => {
      setState((prev) => {
        const next = { ...prev, settings: { ...prev.settings, ...patch } };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const showCrisisNudge = ready
    ? computeShowCrisisNudge(state.entries, latestDay, state.settings.lastCrisisNudgeShownAt)
    : false;

  useEffect(() => {
    if (!ready) return;
    if (showCrisisNudge && state.settings.lastCrisisNudgeShownAt !== todayKey()) {
      updateSettings({ lastCrisisNudgeShownAt: todayKey() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showCrisisNudge]);

  const showCheckInNudge = ready
    ? computeShowCheckInNudge(state.entries, latestDay, state.settings.lastCheckInNudgeShownAt, showCrisisNudge)
    : false;
  // Alternates between the two check-in messages based on the day number,
  // so it stays stable within a day but varies across occurrences.
  const checkInNudgeVariant = latestDay % 2 === 0 ? "talk" : "gratitude";

  useEffect(() => {
    if (!ready) return;
    if (showCheckInNudge && state.settings.lastCheckInNudgeShownAt !== todayKey()) {
      updateSettings({ lastCheckInNudgeShownAt: todayKey() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showCheckInNudge]);

  const completeOnboarding = useCallback(async () => {
    const granted = await requestNotificationPermission();
    let morningOk = false;
    let highlightOk = false;
    let eveningOk = false;
    if (granted) {
      morningOk = await scheduleMorningReminder(8, 0, state.journeyStartDate, state.order);
      highlightOk = await scheduleHighlightReminder(13, 0, state.journeyStartDate, state.order);
      eveningOk = await scheduleEveningReminder(20, 0);
    }
    updateSettings({
      onboarded: true,
      morningReminderEnabled: morningOk,
      morningReminderHour: 8,
      morningReminderMinute: 0,
      highlightReminderEnabled: highlightOk,
      highlightReminderHour: 13,
      highlightReminderMinute: 0,
      eveningReminderEnabled: eveningOk,
      eveningReminderHour: 20,
      eveningReminderMinute: 0,
    });
  }, [state.journeyStartDate, state.order, updateSettings]);

  const restoreFromBackup = useCallback(
    (incoming) => {
      const next = normalizeLoaded(incoming);
      next.settings.onboarded = true;
      setState(next);
      setViewingDay(unlockedDayFor(next.journeyStartDate));
      persist(next);
      return next;
    },
    [persist]
  );

  const viewedEntry = state.entries[`day-${viewingDay}`] || emptyEntry(viewingDay, state.journeyStartDate);
  const streak = computeStreak(state.entries, latestDay);
  const momentsDone = countMomentsDone(state.entries);
  const weeklyRecap = computeWeeklyRecap(state.entries, latestDay);

  // Ask for a store review once a person has shown real, sustained
  // engagement (a 7-day streak — the same threshold as the "Week of Hope"
  // badge), never more than once. requestReview() is itself throttled by
  // the OS and may silently no-op depending on how recently the system
  // last showed any app's review prompt, so this only ever gets one
  // attempt per install, not a nag loop.
  useEffect(() => {
    if (!ready) return;
    if (streak >= 7 && !state.settings.reviewPromptShownAt) {
      updateSettings({ reviewPromptShownAt: todayKey() });
      StoreReview.isAvailableAsync().then((available) => {
        if (available) StoreReview.requestReview();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, streak]);

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
    weeklyRecap,
    showCrisisNudge,
    showCheckInNudge,
    checkInNudgeVariant,
    totalStars: state.totalStars,
    favorites: state.favorites,
    settings: state.settings,
    goToPrevDay,
    goToNextDay,
    jumpToToday,
    setMood,
    setMomentIntention,
    setCustomMoment,
    markMomentDone,
    answerMomentFollowUp,
    saveReflection,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    updateSettings,
    completeOnboarding,
    restoreFromBackup,
  };
}
