// Three daily notifications — a morning one previewing that day's verse, a
// highlight later on with a fact or point about kindness/encouragement/hope
// to nudge the user toward their Barnabas Moment, and an evening one nudging
// the user to reflect and log it. Local (on-device) scheduled notifications
// only — no push server involved. Not supported on web, so every function
// here no-ops there instead of throwing.
//
// Rather than one repeating notification with a fixed message, each
// reminder schedules a rolling window of individual, date-specific
// notifications so the text changes day to day instead of repeating the
// same line forever. The app "tops up" all three windows (see
// useJournalStore) whenever it's opened, so as long as the user opens the
// app at least once every LOOKAHEAD_DAYS, none of the schedules run dry.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { dateKeyForOffset, dayNumberForDate, pickForDay, pickVerseVersion } from "./content";
import { BIBLE_VERSIONS, VERSES } from "./data/verses";
import { HIGHLIGHTS } from "./data/highlights";
import { CONFESSIONS } from "./data/confessions";

const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);

const MORNING_PREFIX = "barnabas-morning-reminder";
const HIGHLIGHT_PREFIX = "barnabas-highlight-reminder";
const EVENING_PREFIX = "barnabas-evening-reminder";
const CONFESSION_PREFIX = "barnabas-confession-reminder";
// Four independent reminder types each schedule a window of
// LOOKAHEAD_DAYS + 1 notifications, so the worst case (all four enabled)
// schedules 4 * (LOOKAHEAD_DAYS + 1) local notifications at once. Kept
// comfortably under iOS's ~64 pending-local-notification cap — at 13 that's
// 56, leaving headroom rather than sitting right at the edge.
const LOOKAHEAD_DAYS = 13;

// Identifiers used by reminder schemes this app shipped in the past, before
// settling on the current morning/highlight/evening split:
//   - "barnabas-daily-reminder": the very first version, a single OS-level
//     REPEATING notification (a fixed, hardcoded "a new verse and a
//     Barnabas moment are ready for you today" line). A repeating
//     notification lives at the OS level until cancelled by this exact
//     identifier — since no current code path references it anymore, it
//     would otherwise keep firing forever on any device that had it
//     scheduled early on.
//   - "barnabas-daily-reminder-1".."-21": the version after that, a rolling
//     21-day window of individual notifications (this had the same
//     verse.versions/.text bug fixed elsewhere in this file, so any still
//     pending would show "undefined").
// Neither is scheduled by any current code, so cancelling them is purely
// cleanup — safe to call unconditionally and every launch.
const LEGACY_IDENTIFIERS = [
  "barnabas-daily-reminder",
  ...Array.from({ length: 21 }, (_, i) => `barnabas-daily-reminder-${i + 1}`),
];

export async function cleanupLegacyNotifications() {
  if (!SUPPORTED) return;
  await Promise.all(
    LEGACY_IDENTIFIERS.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
  );
}

const EVENING_PROMPTS = [
  "How did today really go? A few honest words in your journal might help.",
  "Before you close the day — is there a small kindness worth remembering?",
  "Take a quiet moment tonight: how are you feeling?",
  "Your journal is waiting, whenever you're ready to look back on today.",
  "A gentle nudge: how did your Barnabas moment go today?",
  "Even a few words tonight can be a quiet gift to tomorrow-you.",
  "Before you rest, take a breath and reflect on today.",
];

const SUPPORTED = Platform.OS === "ios" || Platform.OS === "android";

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermission() {
  if (!SUPPORTED) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === "granted") return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
  } catch (e) {
    return false;
  }
}

function morningContentFor(journeyStartDate, order, settings, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const verse = pickForDay(VERSES, dayNumber, order);
  const versionId = pickVerseVersion(dayNumber, settings || {}, VERSE_VERSION_IDS);
  const text = verse.versions[versionId] || verse.versions.KJV;
  return {
    title: "Barnabas Journal",
    body: `“${text}” — ${verse.ref}`,
    data: { screen: "today", section: "verse", dayNumber },
  };
}

function highlightContentFor(journeyStartDate, order, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const highlight = pickForDay(HIGHLIGHTS, dayNumber, order);
  return {
    title: "Barnabas Journal",
    body: highlight,
    data: { screen: "today", section: "fact", dayNumber },
  };
}

function confessionContentFor(journeyStartDate, order, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const confession = pickForDay(CONFESSIONS, dayNumber, order);
  return {
    title: "Barnabas Journal",
    body: `“${confession.text}” — ${confession.ref}. Speak it aloud today.`,
    data: { screen: "today", section: "confession", dayNumber },
  };
}

function eveningContentFor(journeyStartDate, order, offsetDays) {
  const prompt = EVENING_PROMPTS[offsetDays % EVENING_PROMPTS.length];
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  return {
    title: "Barnabas Journal",
    body: prompt,
    data: { screen: "today", section: "reflect", dayNumber },
  };
}

// Starts at offset 0 (today), not 1 (tomorrow) — the "top up" call in
// useJournalStore runs on every single app launch, and cancelWindow below
// wipes the whole window before this rebuilds it. Starting from tomorrow
// meant that simply opening the app — at any time of day — cancelled
// today's already-scheduled highlight/evening notifications and never
// replaced them, so they'd silently never fire unless the app happened to
// stay unopened all day. Today's slot is skipped only if its time has
// already passed, so reopening the app late in the day doesn't fire an
// immediate "surprise" notification for a moment that's already gone by.
async function scheduleWindow(prefix, hour, minute, contentFor) {
  const now = new Date();
  for (let offset = 0; offset <= LOOKAHEAD_DAYS; offset++) {
    const targetKey = dateKeyForOffset(offset);
    const [y, m, d] = targetKey.split("-").map(Number);
    const fireDate = new Date(y, m - 1, d, hour, minute, 0, 0);
    if (fireDate <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${prefix}-${offset}`,
      content: contentFor(offset),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
    });
  }
}

async function cancelWindow(prefix) {
  if (!SUPPORTED) return;
  try {
    const ids = Array.from({ length: LOOKAHEAD_DAYS + 1 }, (_, i) => `${prefix}-${i}`);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  } catch (e) {
    // nothing scheduled — fine
  }
}

// Serializes every cancel/schedule call for a given reminder prefix onto
// one promise chain per prefix, so e.g. the app-launch "top up" and a
// user toggling that same reminder in Settings moments later can never
// interleave — one full cancelWindow+scheduleWindow (or a bare
// cancelWindow) always finishes before the next one for that prefix
// starts, instead of racing and potentially leaving stale notifications
// behind that neither call meant to leave scheduled.
const prefixQueues = new Map();
function withPrefixQueue(prefix, fn) {
  const prior = prefixQueues.get(prefix) || Promise.resolve();
  const next = prior.catch(() => {}).then(fn);
  prefixQueues.set(prefix, next);
  return next;
}

export async function scheduleMorningReminder(hour, minute, journeyStartDate, order, settings) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  return withPrefixQueue(MORNING_PREFIX, async () => {
    try {
      await cancelWindow(MORNING_PREFIX);
      await scheduleWindow(MORNING_PREFIX, hour, minute, (offset) =>
        morningContentFor(journeyStartDate, order, settings, offset)
      );
      return true;
    } catch (e) {
      return false;
    }
  });
}

export async function cancelMorningReminder() {
  await withPrefixQueue(MORNING_PREFIX, () => cancelWindow(MORNING_PREFIX));
}

export async function scheduleHighlightReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  return withPrefixQueue(HIGHLIGHT_PREFIX, async () => {
    try {
      await cancelWindow(HIGHLIGHT_PREFIX);
      await scheduleWindow(HIGHLIGHT_PREFIX, hour, minute, (offset) =>
        highlightContentFor(journeyStartDate, order, offset)
      );
      return true;
    } catch (e) {
      return false;
    }
  });
}

export async function cancelHighlightReminder() {
  await withPrefixQueue(HIGHLIGHT_PREFIX, () => cancelWindow(HIGHLIGHT_PREFIX));
}

export async function scheduleConfessionReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  return withPrefixQueue(CONFESSION_PREFIX, async () => {
    try {
      await cancelWindow(CONFESSION_PREFIX);
      await scheduleWindow(CONFESSION_PREFIX, hour, minute, (offset) =>
        confessionContentFor(journeyStartDate, order, offset)
      );
      return true;
    } catch (e) {
      return false;
    }
  });
}

export async function cancelConfessionReminder() {
  await withPrefixQueue(CONFESSION_PREFIX, () => cancelWindow(CONFESSION_PREFIX));
}

export async function scheduleEveningReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  return withPrefixQueue(EVENING_PREFIX, async () => {
    try {
      await cancelWindow(EVENING_PREFIX);
      await scheduleWindow(EVENING_PREFIX, hour, minute, (offset) => eveningContentFor(journeyStartDate, order, offset));
      return true;
    } catch (e) {
      return false;
    }
  });
}

export async function cancelEveningReminder() {
  await withPrefixQueue(EVENING_PREFIX, () => cancelWindow(EVENING_PREFIX));
}

export const notificationsSupported = SUPPORTED;
