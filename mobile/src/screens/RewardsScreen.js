import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { BADGE_DEFS } from "../storage";
import { exportBackup, pickAndReadBackup } from "../backup";
import { scheduleDailyReminder, cancelDailyReminder, notificationsSupported } from "../notifications";

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
    const ok = await scheduleDailyReminder(settings.reminderHour, settings.reminderMinute);
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
      await scheduleDailyReminder(preset.hour, preset.minute);
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
