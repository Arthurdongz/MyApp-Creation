// Journal state, persistence (AsyncStorage), and rewards logic for
// Barnabas Journal. Content is organized around a per-user "journey day"
// number (1..366), not the calendar day-of-year: each user gets their own
// shuffled order of the 366 content slots on first use, and a new day
// unlocks once per real calendar day since then.

import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import i18n from "./i18n";
import { todayKey, shuffledOrder, unlockedDayFor, dateKeyForDayNumber, isValidOrder, TOTAL_DAYS } from "./content";
import {
  requestNotificationPermission,
  scheduleMorningReminder,
  scheduleHighlightReminder,
  scheduleEveningReminder,
  scheduleConfessionReminder,
  cleanupLegacyNotifications,
} from "./notifications";

const STORAGE_KEY = "barnabasJournalStateV2";

// journeyStartDate and order decide which verse/encouragement/moment/story
// show on a given day, and are set once, at journey creation, and never
// recomputed afterward — except as a fallback when AsyncStorage.getItem
// comes back empty or fails validation. On Android, the main state blob
// above grows over time (it holds every journal entry ever written) and is
// written as a single all-or-nothing JSON value; some devices can fail to
// persist that write cleanly across a reboot (a known AsyncStorage/SQLite
// issue on certain OEMs), which trips the "no data" fallback and silently
// starts a fresh journey with a newly shuffled order — shifting that day's
// content even though it's still the same day. Mirroring just these two
// small, truly-immutable values into their own tiny key makes them far less
// likely to be lost the same way, and gives the loader a resilient anchor
// to fall back on even if the (much larger, more failure-prone) main blob
// didn't survive.
const IDENTITY_KEY = "barnabasJournalIdentityV1";

function isValidIdentity(candidate) {
  return Boolean(
    candidate &&
      typeof candidate.journeyStartDate === "string" &&
      Array.isArray(candidate.order) &&
      candidate.order.length === TOTAL_DAYS
  );
}

export const BADGE_DEFS = [
  {
    id: "seed",
    icon: { set: "Ionicons", name: "leaf-outline" },
    name: "Seed of Encouragement",
    desc: "Earn 10 stars",
    type: "stars",
    threshold: 10,
  },
  {
    id: "growing",
    icon: { set: "Ionicons", name: "leaf" },
    name: "Growing in Grace",
    desc: "Earn 50 stars",
    type: "stars",
    threshold: 50,
  },
  {
    id: "heart",
    icon: { set: "Ionicons", name: "heart" },
    name: "Barnabas Heart",
    desc: "Earn 100 stars",
    type: "stars",
    threshold: 100,
  },
  {
    id: "son",
    icon: { set: "FontAwesome5", name: "dove", solid: true },
    name: "Son of Encouragement",
    desc: "Earn 250 stars",
    type: "stars",
    threshold: 250,
  },
  {
    id: "steady",
    icon: { set: "MaterialCommunityIcons", name: "candle" },
    name: "Steady Companion",
    desc: "3-day streak",
    type: "streak",
    threshold: 3,
  },
  {
    id: "week",
    icon: { set: "Ionicons", name: "sunny" },
    name: "Week of Hope",
    desc: "7-day streak",
    type: "streak",
    threshold: 7,
  },
  {
    id: "faithful",
    icon: { set: "Ionicons", name: "star" },
    name: "Faithful Encourager",
    desc: "30-day streak",
    type: "streak",
    threshold: 30,
  },
];

// New journeys default to Spanish scripture (RVA, pinned rather than
// rotated) when the device's detected language is Spanish, so a Spanish-UI
// user doesn't land on mostly-English verses by default — they can still
// switch to any English translation in Settings. Existing users are
// unaffected: their already-saved verseVersionMode/verseFavoriteVersion
// values always win over this default (see normalizeLoaded's merge).
// Portuguese-locale devices get the same treatment, pinned to ALM1911.
// French-locale devices get the same treatment, pinned to LSG.
function defaultSettings() {
  const isSpanish = i18n.language === "es";
  const isPortuguese = i18n.language === "pt";
  const isFrench = i18n.language === "fr";
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
    confessionReminderEnabled: false,
    confessionReminderHour: 7,
    confessionReminderMinute: 0,
    speechVoiceURI: "",
    speechPitch: 1,
    speechRate: 0.95,
    lastCrisisNudgeShownAt: null,
    lastCheckInNudgeShownAt: null,
    verseVersionMode: isSpanish || isPortuguese || isFrench ? "favorite" : "alternate",
    verseFavoriteVersion: isSpanish ? "RVA" : isPortuguese ? "ALM1911" : isFrench ? "LSG" : "KJV",
    reviewPromptShownAt: null,
    tourShown: false,
    chatQuotaMonthKey: null,
    chatMessagesUsed: 0,
    chatSubscribed: false,
    // null = trust the device locale guess (see crisisResources.js);
    // a region code or "OTHER" means the user corrected it by hand in
    // Settings because the device guessed wrong.
    crisisRegionOverride: null,
    // Which chatConversations entry "Talk to Barnabas" resumes into, and
    // when it was last touched — see openChatConversation's session-timeout
    // logic below. Both null until the first message of the first ever
    // conversation is sent.
    activeChatConversationId: null,
    chatLastActiveAt: null,
  };
}

function freshJourney() {
  return {
    journeyStartDate: todayKey(),
    order: shuffledOrder(TOTAL_DAYS),
    entries: {},
    totalStars: 0,
    favorites: [],
    chatConversations: [],
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
    chatConversations: parsed.chatConversations || [],
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

// The chatbot gives CHAT_FREE_MESSAGES_PER_MONTH free messages every
// calendar month, forever — not a one-time trial. chatQuotaMonthKey +
// chatMessagesUsed track usage for whichever month they last refer to;
// once the current month doesn't match chatQuotaMonthKey, the count is
// stale and the month's full quota is available again (see
// recordChatMessageSent, which does the actual rollover). chatSubscribed
// — set by a real purchase flow once one exists; there is no such flow
// yet, so subscribing is currently a no-op stub in ChatScreen — grants
// unlimited messages regardless of the monthly count.
const CHAT_FREE_MESSAGES_PER_MONTH = 100;

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function computeChatAccess(settings) {
  if (settings.chatSubscribed) {
    return { granted: true, unlimited: true, messagesUsed: 0, messagesLeft: null, limit: null };
  }
  const messagesUsed = settings.chatQuotaMonthKey === currentMonthKey() ? settings.chatMessagesUsed : 0;
  const messagesLeft = Math.max(0, CHAT_FREE_MESSAGES_PER_MONTH - messagesUsed);
  return { granted: messagesLeft > 0, unlimited: false, messagesUsed, messagesLeft, limit: CHAT_FREE_MESSAGES_PER_MONTH };
}

// How long "Talk to Barnabas" stays on the same conversation with no
// activity before the next open starts a fresh one instead. Backed by a
// persisted timestamp (chatLastActiveAt) rather than any in-memory
// session flag, so it works the same whether the gap was spent idling in
// the app, backgrounded, or the app was fully closed and relaunched —
// there's no reliable "was it actually killed" signal in Expo, and a hard
// reset on every brief backgrounding (e.g. checking a notification) would
// feel broken, so wall-clock time since the last message is the signal.
const CHAT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function newChatConversation() {
  const now = Date.now();
  return { id: `chat-${now}-${Math.random().toString(36).slice(2, 8)}`, startedAt: now, updatedAt: now, messages: [] };
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

// A look back across the whole journey (or the trailing 365 days, whichever
// is shorter) for a "year in review" style recap. longestStreak here is a
// simple longest-consecutive-days-shown-up count within the window — it
// intentionally doesn't apply the grace-day rule computeStreak uses, since
// this is a retrospective highlight ("your best run"), not the live streak
// number that determines badges.
export function computeYearInReview(entries, favorites, latestDay) {
  const start = Math.max(1, latestDay - 364);
  let daysShownUp = 0;
  let momentsDone = 0;
  let journalEntries = 0;
  let kindnessReceived = 0;
  let longestStreak = 0;
  let currentRun = 0;
  for (let day = start; day <= latestDay; day++) {
    const entry = entries[`day-${day}`];
    const hasActivity =
      entry && (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal);
    if (hasActivity) {
      daysShownUp += 1;
      currentRun += 1;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 0;
    }
    if (entry && entry.momentDone) momentsDone += 1;
    if (entry && (entry.reflection || entry.barnabasNote)) journalEntries += 1;
    if (entry && entry.receivedKindness) kindnessReceived += 1;
  }
  const favoritesSaved = favorites.filter((f) => f.dayNumber >= start && f.dayNumber <= latestDay).length;
  const totalDays = latestDay - start + 1;
  return {
    totalDays,
    daysShownUp,
    momentsDone,
    journalEntries,
    kindnessReceived,
    longestStreak,
    favoritesSaved,
    isFullYear: totalDays >= 365,
  };
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

// (Re-)schedules every enabled reminder against the given state's
// journeyStartDate/order/settings. Called on every app launch (the "top
// up" effect below) and also directly after a backup restore — a restore
// can swap in a different journeyStartDate/order/settings than whatever
// was last scheduled, and without an explicit re-arm here any
// already-enabled reminders would keep firing with stale, pre-restore
// content until the next full app launch.
function topUpReminders(targetState) {
  // Cancels notifications left behind by reminder schemes this app used
  // to have, unconditionally — independent of the user's current
  // reminder settings, since a stale one can outlive the feature that
  // scheduled it (see notifications.js for the full story).
  cleanupLegacyNotifications();
  if (targetState.settings.morningReminderEnabled) {
    scheduleMorningReminder(
      targetState.settings.morningReminderHour,
      targetState.settings.morningReminderMinute,
      targetState.journeyStartDate,
      targetState.order,
      targetState.settings
    );
  }
  if (targetState.settings.highlightReminderEnabled) {
    scheduleHighlightReminder(
      targetState.settings.highlightReminderHour,
      targetState.settings.highlightReminderMinute,
      targetState.journeyStartDate,
      targetState.order
    );
  }
  if (targetState.settings.eveningReminderEnabled) {
    scheduleEveningReminder(
      targetState.settings.eveningReminderHour,
      targetState.settings.eveningReminderMinute,
      targetState.journeyStartDate,
      targetState.order
    );
  }
  if (targetState.settings.confessionReminderEnabled) {
    scheduleConfessionReminder(
      targetState.settings.confessionReminderHour,
      targetState.settings.confessionReminderMinute,
      targetState.journeyStartDate,
      targetState.order
    );
  }
}

export function useJournalStore() {
  const [state, setState] = useState(freshJourney());
  const [ready, setReady] = useState(false);
  const [viewingDay, setViewingDay] = useState(1);

  // Chains every persist() call onto the previous one instead of firing
  // AsyncStorage.setItem calls concurrently — mutators (toggleFavorite,
  // saveReflection, etc.) can call persist() in quick succession, and
  // without an explicit queue there's no guarantee two overlapping writes
  // to the same key complete in call order, which could leave a later
  // change reverted by an earlier write that happened to finish last.
  const persistQueueRef = useRef(Promise.resolve());

  const persist = useCallback((next) => {
    persistQueueRef.current = persistQueueRef.current
      .catch(() => {})
      .then(() =>
        Promise.all([
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)),
          // The identity pair never changes after journey creation, so this
          // is a cheap, small, low-risk write to keep the resilient anchor
          // current — in practice it writes the same bytes every time
          // after the first save.
          AsyncStorage.setItem(
            IDENTITY_KEY,
            JSON.stringify({ journeyStartDate: next.journeyStartDate, order: next.order })
          ),
        ])
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      let identity = null;
      try {
        const rawIdentity = await AsyncStorage.getItem(IDENTITY_KEY);
        if (rawIdentity) {
          const parsedIdentity = JSON.parse(rawIdentity);
          if (isValidIdentity(parsedIdentity)) identity = parsedIdentity;
        }
      } catch (e) {
        identity = null;
      }

      let loaded = freshJourney();
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.journeyStartDate && isValidOrder(parsed.order)) {
            loaded = normalizeLoaded(parsed);
          }
        }
      } catch (e) {
        loaded = freshJourney();
      }

      if (identity) {
        // The identity key is the more resilient of the two — trust it for
        // these two fields even if the main blob disagreed or was lost.
        loaded = { ...loaded, journeyStartDate: identity.journeyStartDate, order: identity.order };
      } else {
        // First launch since this fix shipped (or a genuinely fresh
        // install) — protect whatever we resolved, going forward.
        AsyncStorage.setItem(
          IDENTITY_KEY,
          JSON.stringify({ journeyStartDate: loaded.journeyStartDate, order: loaded.order })
        ).catch(() => {});
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
    topUpReminders(state);
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

  // Used to land on the exact day a tapped notification was about — mainly
  // matters when someone taps a notification after its day has passed
  // (e.g. the next morning), so they see the day it actually quoted rather
  // than whatever "today" has since become.
  const jumpToDay = useCallback(
    (dayNumber) => {
      if (!Number.isFinite(dayNumber)) return;
      setViewingDay(Math.min(latestDay, Math.max(1, dayNumber)));
    },
    [latestDay]
  );

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

  // Called after a chat message successfully round-trips (not before —
  // network failures and Worker errors shouldn't burn quota). Rolls the
  // count over to 1 if the current month doesn't match chatQuotaMonthKey
  // yet, otherwise just increments it.
  const recordChatMessageSent = useCallback(() => {
    setState((prev) => {
      // Subscribed users have unlimited messages (see computeChatAccess) —
      // don't keep accumulating chatMessagesUsed while subscribed, or a
      // later cancellation would find the quota already exhausted for
      // whatever's left of that month even though none of it was actually
      // used against the free allowance.
      if (prev.settings.chatSubscribed) return prev;
      const monthKey = currentMonthKey();
      const messagesUsed = prev.settings.chatQuotaMonthKey === monthKey ? prev.settings.chatMessagesUsed + 1 : 1;
      const next = {
        ...prev,
        settings: { ...prev.settings, chatQuotaMonthKey: monthKey, chatMessagesUsed: messagesUsed },
      };
      persist(next);
      return next;
    });
  }, [persist]);

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

  // Resolves which conversation "Talk to Barnabas" should open into: the
  // existing active one if it's still within the session window (see
  // CHAT_SESSION_TIMEOUT_MS) and actually has messages, otherwise a brand
  // new, not-yet-persisted one — nothing is written to chatConversations
  // here (a pure read), so opening chat and never typing anything leaves
  // no empty entry behind in History. Call once per chat screen open.
  const openChatConversation = useCallback(() => {
    const { activeChatConversationId, chatLastActiveAt } = state.settings;
    const withinWindow =
      activeChatConversationId &&
      chatLastActiveAt &&
      Date.now() - chatLastActiveAt <= CHAT_SESSION_TIMEOUT_MS;
    const existing = withinWindow
      ? state.chatConversations.find((c) => c.id === activeChatConversationId && c.messages.length > 0)
      : null;
    return existing || newChatConversation();
  }, [state.settings, state.chatConversations]);

  // Appends a message to `conversation` (the object openChatConversation or
  // a History row handed back), inserting it into chatConversations for the
  // first time if this is its first message. Also marks it the active
  // conversation, so the next chat open resumes it instead of starting over.
  const appendChatMessage = useCallback(
    (conversation, message) => {
      setState((prev) => {
        const now = Date.now();
        const exists = prev.chatConversations.some((c) => c.id === conversation.id);
        const chatConversations = exists
          ? prev.chatConversations.map((c) =>
              c.id === conversation.id ? { ...c, messages: [...c.messages, message], updatedAt: now } : c
            )
          : [{ ...conversation, messages: [message], updatedAt: now }, ...prev.chatConversations];
        const next = {
          ...prev,
          chatConversations,
          settings: { ...prev.settings, activeChatConversationId: conversation.id, chatLastActiveAt: now },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // Explicitly reopening a past conversation from History always resumes
  // it, regardless of how long ago it was last touched — the 30-minute
  // timeout only governs which conversation a plain chat open lands on,
  // not a deliberate pick from the list.
  const resumeChatConversation = useCallback(
    (conversationId) => {
      setState((prev) => {
        const next = {
          ...prev,
          settings: { ...prev.settings, activeChatConversationId: conversationId, chatLastActiveAt: Date.now() },
        };
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
      morningOk = await scheduleMorningReminder(8, 0, state.journeyStartDate, state.order, state.settings);
      highlightOk = await scheduleHighlightReminder(13, 0, state.journeyStartDate, state.order);
      eveningOk = await scheduleEveningReminder(20, 0, state.journeyStartDate, state.order);
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
  }, [state.journeyStartDate, state.order, state.settings, updateSettings]);

  const restoreFromBackup = useCallback(
    (incoming) => {
      const next = normalizeLoaded(incoming);
      next.settings.onboarded = true;
      setState(next);
      setViewingDay(unlockedDayFor(next.journeyStartDate));
      persist(next);
      // The "top up" effect only runs once per app launch (keyed on
      // `ready`), so a restore needs its own explicit re-arm — otherwise
      // any reminder already enabled keeps firing with pre-restore content
      // until the app is fully relaunched.
      topUpReminders(next);
      return next;
    },
    [persist]
  );

  const viewedEntry = state.entries[`day-${viewingDay}`] || emptyEntry(viewingDay, state.journeyStartDate);
  const streak = computeStreak(state.entries, latestDay);
  const momentsDone = countMomentsDone(state.entries);
  const weeklyRecap = computeWeeklyRecap(state.entries, latestDay);
  const yearInReview = computeYearInReview(state.entries, state.favorites, latestDay);
  const chatAccess = computeChatAccess(state.settings);

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
    yearInReview,
    chatAccess,
    recordChatMessageSent,
    chatConversations: state.chatConversations,
    openChatConversation,
    appendChatMessage,
    resumeChatConversation,
    showCrisisNudge,
    showCheckInNudge,
    checkInNudgeVariant,
    totalStars: state.totalStars,
    favorites: state.favorites,
    settings: state.settings,
    goToPrevDay,
    goToNextDay,
    jumpToToday,
    jumpToDay,
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
