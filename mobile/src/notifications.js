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
import { dateKeyForOffset, dayNumberForDate, pickForDay } from "./content";
import { VERSES } from "./data/verses";
import { HIGHLIGHTS } from "./data/highlights";

const MORNING_PREFIX = "barnabas-morning-reminder";
const HIGHLIGHT_PREFIX = "barnabas-highlight-reminder";
const EVENING_PREFIX = "barnabas-evening-reminder";
const LOOKAHEAD_DAYS = 21;

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

function morningContentFor(journeyStartDate, order, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const verse = pickForDay(VERSES, dayNumber, order);
  return {
    title: "Barnabas Journal",
    body: `“${verse.text}” — ${verse.ref}`,
  };
}

function highlightContentFor(journeyStartDate, order, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const highlight = pickForDay(HIGHLIGHTS, dayNumber, order);
  return {
    title: "Barnabas Journal",
    body: highlight,
  };
}

function eveningContentFor(offsetDays) {
  const prompt = EVENING_PROMPTS[(offsetDays - 1) % EVENING_PROMPTS.length];
  return { title: "Barnabas Journal", body: prompt };
}

async function scheduleWindow(prefix, hour, minute, contentFor) {
  for (let offset = 1; offset <= LOOKAHEAD_DAYS; offset++) {
    const targetKey = dateKeyForOffset(offset);
    const [y, m, d] = targetKey.split("-").map(Number);
    const fireDate = new Date(y, m - 1, d, hour, minute, 0, 0);
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
    const ids = Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => `${prefix}-${i + 1}`);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  } catch (e) {
    // nothing scheduled — fine
  }
}

export async function scheduleMorningReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await cancelWindow(MORNING_PREFIX);
    await scheduleWindow(MORNING_PREFIX, hour, minute, (offset) => morningContentFor(journeyStartDate, order, offset));
    return true;
  } catch (e) {
    return false;
  }
}

export async function cancelMorningReminder() {
  await cancelWindow(MORNING_PREFIX);
}

export async function scheduleHighlightReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await cancelWindow(HIGHLIGHT_PREFIX);
    await scheduleWindow(HIGHLIGHT_PREFIX, hour, minute, (offset) =>
      highlightContentFor(journeyStartDate, order, offset)
    );
    return true;
  } catch (e) {
    return false;
  }
}

export async function cancelHighlightReminder() {
  await cancelWindow(HIGHLIGHT_PREFIX);
}

export async function scheduleEveningReminder(hour, minute) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await cancelWindow(EVENING_PREFIX);
    await scheduleWindow(EVENING_PREFIX, hour, minute, (offset) => eveningContentFor(offset));
    return true;
  } catch (e) {
    return false;
  }
}

export async function cancelEveningReminder() {
  await cancelWindow(EVENING_PREFIX);
}

export const notificationsSupported = SUPPORTED;
