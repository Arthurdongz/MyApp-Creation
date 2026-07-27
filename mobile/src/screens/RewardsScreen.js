import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme";
import { BADGE_DEFS } from "../storage";
import { exportBackup, pickAndReadBackup } from "../backup";
import { scheduleDailyReminder, cancelDailyReminder, notificationsSupported } from "../notifications";
import { SHARE_THEMES } from "../shareThemes";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

const REMINDER_PRESETS = [
  { label: "Morning · 8:00", hour: 8, minute: 0 },
  { label: "Midday · 13:00", hour: 13, minute: 0 },
  { label: "Evening · 19:00", hour: 19, minute: 0 },
];

export default function RewardsScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { totalStars, streak, momentsDone, settings, updateSettings } = store;
  const [backupMsg, setBackupMsg] = useState("");

  const showBackupMsg = (text) => {
    setBackupMsg(text);
    setTimeout(() => setBackupMsg(""), 4000);
  };

  const handleExport = async () => {
    try {
      await exportBackup(store.state);
    } catch (e) {
      showBackupMsg("Couldn't export a backup right now.");
    }
  };

  const handleImport = async () => {
    try {
      const incoming = await pickAndReadBackup();
      if (!incoming) return;
      store.restoreFromBackup(incoming);
      showBackupMsg("Backup restored. Welcome back!");
    } catch (e) {
      showBackupMsg(e.message || "That file doesn't look like a valid backup.");
    }
  };

  const handleReminderToggle = async () => {
    if (settings.reminderEnabled) {
      await cancelDailyReminder();
      updateSettings({ reminderEnabled: false });
      return;
    }
    const ok = await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute, store.state.journeyStartDate, store.order);
    if (ok) {
      updateSettings({ reminderEnabled: true });
    } else {
      Alert.alert(
        "Notifications not enabled",
        "We couldn't schedule a reminder — check that notifications are allowed for this app in your device settings."
      );
    }
  };

  const handlePreset = async (preset) => {
    updateSettings({ reminderHour: preset.hour, reminderMinute: preset.minute });
    if (settings.reminderEnabled) {
      await scheduleDailyReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order);
    }
  };

  return (
    <View>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.subtitle}>A small way to notice how far you've come.</Text>

      <View style={styles.summaryRow}>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{totalStars}</Text>
          <Text style={styles.tileLabel}>Total Stars</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{streak}</Text>
          <Text style={styles.tileLabel}>Day Streak</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{momentsDone}</Text>
          <Text style={styles.tileLabel}>Barnabas Moments</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgesGrid}>
        {BADGE_DEFS.map((b) => {
          const value = b.type === "stars" ? totalStars : streak;
          const earned = value >= b.threshold;
          return (
            <View key={b.id} style={[styles.badge, !earned && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Quote Card Color</Text>
      <Text style={styles.subtitle}>Choose a background for verses, quotes, and stories you share.</Text>
      <View style={styles.shareThemeRow}>
        {SHARE_THEMES.map((t) => {
          const selected = settings.shareTheme === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => updateSettings({ shareTheme: t.id })}
              style={[styles.shareThemeSwatchWrap, selected && styles.shareThemeSwatchWrapSelected]}
            >
              <LinearGradient
                colors={t.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shareThemeSwatch}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Mood Calendar</Text>
      <Text style={styles.subtitle}>How you've been feeling, day by day.</Text>
      <MoodCalendar store={store} styles={styles} />

      {notificationsSupported ? (
        <>
          <Text style={styles.sectionTitle}>Daily Reminder</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Remind me once a day</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.reminderEnabled && styles.switchTrackOn]}
                onPress={handleReminderToggle}
              >
                <View style={[styles.switchThumb, settings.reminderEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>
            <View style={styles.presetRow}>
              {REMINDER_PRESETS.map((preset) => {
                const active = settings.reminderHour === preset.hour && settings.reminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => handlePreset(preset)}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Backup</Text>
      <Text style={styles.subtitle}>
        Your journal lives only on this device. Export a backup now and then, or restore one here.
      </Text>
      <View style={styles.backupRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleExport}>
          <Text style={styles.secondaryBtnText}>Export Backup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport}>
          <Text style={styles.secondaryBtnText}>Restore Backup</Text>
        </TouchableOpacity>
      </View>
      {backupMsg ? <Text style={styles.backupMsg}>{backupMsg}</Text> : null}
    </View>
  );
}

function MoodCalendar({ store, styles }) {
  const entries = store.state.entries;
  const latest = store.latestDay;
  const start = Math.max(1, latest - 34);
  const days = [];
  for (let day = start; day <= latest; day++) {
    days.push(day);
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={styles.moodGrid}>
        {days.map((day) => {
          const entry = entries[`day-${day}`];
          const mood = entry && entry.mood;
          const dateLabel = entry ? formatDate(entry.dateLogged) : `Day ${day}`;
          return (
            <View
              key={day}
              style={[styles.moodCell, !mood && styles.moodCellEmpty]}
              accessibilityLabel={dateLabel}
            >
              <Text style={styles.moodCellEmoji}>{mood ? MOOD_EMOJI[mood] : ""}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.moodLegendRow}>
        {Object.entries(MOOD_EMOJI).map(([mood, emoji]) => (
          <Text key={mood} style={styles.moodLegendItem}>
            {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 20 },
    summaryRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    tile: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 6,
      alignItems: "center",
      ...shadow,
    },
    tileNumber: { fontSize: 26, fontWeight: "800", color: colors.sageDark },
    tileLabel: { fontSize: 11, color: colors.textSoft, textAlign: "center", marginTop: 2 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark, marginBottom: 12, marginTop: 4 },
    badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
    badge: {
      width: "47%",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      ...shadow,
    },
    badgeLocked: { opacity: 0.4 },
    badgeIcon: { fontSize: 24, marginBottom: 6 },
    badgeName: { fontSize: 13, fontWeight: "700", color: colors.sageDark, textAlign: "center" },
    badgeDesc: { fontSize: 11, color: colors.textSoft, marginTop: 2, textAlign: "center" },
    settingsCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 8,
      ...shadow,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    settingsLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
    switchTrack: {
      width: 46,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.border,
      padding: 3,
      justifyContent: "center",
    },
    switchTrackOn: { backgroundColor: colors.sage },
    switchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#fff",
    },
    switchThumbOn: { alignSelf: "flex-end" },
    presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    presetBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    presetBtnActive: { backgroundColor: colors.sage, borderColor: colors.sage },
    presetText: { fontSize: 12, fontWeight: "600", color: colors.textSoft },
    presetTextActive: { color: "#fff" },
    shareThemeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    shareThemeSwatchWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 3,
      borderColor: "transparent",
      ...shadow,
    },
    shareThemeSwatchWrapSelected: { borderColor: colors.sageDark },
    shareThemeSwatch: {
      flex: 1,
      borderRadius: 20,
    },
    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 12,
    },
    moodCell: {
      width: "12%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moodCellEmpty: { backgroundColor: "transparent", borderStyle: "dashed", opacity: 0.5 },
    moodCellEmoji: { fontSize: 14 },
    moodLegendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    moodLegendItem: { fontSize: 12, color: colors.textSoft },
    backupRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 11,
      paddingHorizontal: 16,
    },
    secondaryBtnText: { color: colors.sageDark, fontWeight: "700", fontSize: 13 },
    backupMsg: { marginTop: 10, fontSize: 13, fontWeight: "600", color: colors.sageDark },
  });
}
