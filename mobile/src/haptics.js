// Small, consistent haptic touches at a handful of meaningful moments
// (marking a moment done, saving a reflection, picking a mood/color) —
// the kind of subtle feedback that makes an app feel considered rather
// than just functional. Silently no-ops on devices/platforms without
// haptics support (e.g. web), so it's always safe to call.

import * as Haptics from "expo-haptics";

export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
