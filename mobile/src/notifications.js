// Daily reminder notifications. Local (on-device) scheduled notifications
// only — no push server involved. Not supported on web, so every function
// here no-ops there instead of throwing.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const REMINDER_IDENTIFIER = "barnabas-daily-reminder";

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

function dailyTrigger(hour, minute) {
  // expo-notifications' trigger shape has changed across SDK versions; try
  // the newer typed form first and fall back to the classic one.
  if (Notifications.SchedulableTriggerInputTypes) {
    return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute };
  }
  return { hour, minute, repeats: true };
}

export async function scheduleDailyReminder(hour, minute) {
  if (!SUPPORTED) return false;
  const granted = await requestNotificationPermission();
  if (!granted) return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDENTIFIER,
      content: {
        title: "Barnabas Journal",
        body: "A new verse and a Barnabas moment are ready for you today.",
      },
      trigger: dailyTrigger(hour, minute),
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function cancelDailyReminder() {
  if (!SUPPORTED) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch (e) {
    // nothing scheduled — fine
  }
}

export const notificationsSupported = SUPPORTED;
