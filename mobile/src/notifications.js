// Daily reminder notifications. Local (on-device) scheduled notifications
// only — no push server involved. Not supported on web, so every function
// here no-ops there instead of throwing.
//
// Rather than one repeating notification with a fixed message, we schedule
// a rolling window of individual, date-specific notifications — each one
// previewing that day's actual verse, so the reminder text changes day to
// day instead of repeating the same line forever. The app "tops up" this
// window (see useJournalStore) whenever it's opened, so as long as the user
// opens the app at least once every LOOKAHEAD_DAYS, the schedule never runs
// dry.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { dateKeyForOffset, dayNumberForDate, pickForDay } from "./content";
import { VERSES } from "./data/verses";

const REMINDER_PREFIX = "barnabas-daily-reminder";
const LOOKAHEAD_DAYS = 21;

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

function reminderContentFor(journeyStartDate, order, offsetDays) {
  const targetKey = dateKeyForOffset(offsetDays);
  const dayNumber = dayNumberForDate(journeyStartDate, targetKey);
  const verse = pickForDay(VERSES, dayNumber, order);
  return {
    title: "Barnabas Journal",
    body: `“${verse.text}” — ${verse.ref}`,
  };
}

export async function scheduleDailyReminder(hour, minute, journeyStartDate, order) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await cancelDailyReminder();
    for (let offset = 1; offset <= LOOKAHEAD_DAYS; offset++) {
      const targetKey = dateKeyForOffset(offset);
      const [y, m, d] = targetKey.split("-").map(Number);
      const fireDate = new Date(y, m - 1, d, hour, minute, 0, 0);
      await Notifications.scheduleNotificationAsync({
        identifier: `${REMINDER_PREFIX}-${offset}`,
        content: reminderContentFor(journeyStartDate, order, offset),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
      });
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function cancelDailyReminder() {
  if (!SUPPORTED) return;
  try {
    const ids = Array.from({ length: LOOKAHEAD_DAYS }, (_, i) => `${REMINDER_PREFIX}-${i + 1}`);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  } catch (e) {
    // nothing scheduled — fine
  }
}

export const notificationsSupported = SUPPORTED;
