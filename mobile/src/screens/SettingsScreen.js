import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { exportBackup, pickAndReadBackup } from "../backup";
import {
  scheduleMorningReminder,
  cancelMorningReminder,
  scheduleEveningReminder,
  cancelEveningReminder,
  notificationsSupported,
} from "../notifications";

const MORNING_PRESETS = [
  { label: "6:00 AM", hour: 6, minute: 0 },
  { label: "7:00 AM", hour: 7, minute: 0 },
  { label: "8:00 AM", hour: 8, minute: 0 },
  { label: "9:00 AM", hour: 9, minute: 0 },
];

const EVENING_PRESETS = [
  { label: "6:00 PM", hour: 18, minute: 0 },
  { label: "7:00 PM", hour: 19, minute: 0 },
  { label: "8:00 PM", hour: 20, minute: 0 },
  { label: "9:00 PM", hour: 21, minute: 0 },
];

export default function SettingsScreen({ store, onClose }) {
  const { colors, shadow, mode, toggleTheme } = useTheme();
  const styles = getStyles(colors, shadow);
  const { settings, updateSettings } = store;
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

  const handleMorningToggle = async () => {
    if (settings.morningReminderEnabled) {
      await cancelMorningReminder();
      updateSettings({ morningReminderEnabled: false });
      return;
    }
    const ok = await scheduleMorningReminder(
      settings.morningReminderHour,
      settings.morningReminderMinute,
      store.state.journeyStartDate,
      store.order
    );
    if (ok) {
      updateSettings({ morningReminderEnabled: true });
    } else {
      Alert.alert(
        "Notifications not enabled",
        "We couldn't schedule a reminder — check that notifications are allowed for this app in your device settings."
      );
    }
  };

  const handleMorningPreset = async (preset) => {
    updateSettings({ morningReminderHour: preset.hour, morningReminderMinute: preset.minute });
    if (settings.morningReminderEnabled) {
      await scheduleMorningReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order);
    }
  };

  const handleEveningToggle = async () => {
    if (settings.eveningReminderEnabled) {
      await cancelEveningReminder();
      updateSettings({ eveningReminderEnabled: false });
      return;
    }
    const ok = await scheduleEveningReminder(settings.eveningReminderHour, settings.eveningReminderMinute);
    if (ok) {
      updateSettings({ eveningReminderEnabled: true });
    } else {
      Alert.alert(
        "Notifications not enabled",
        "We couldn't schedule a reminder — check that notifications are allowed for this app in your device settings."
      );
    }
  };

  const handleEveningPreset = async (preset) => {
    updateSettings({ eveningReminderHour: preset.hour, eveningReminderMinute: preset.minute });
    if (settings.eveningReminderEnabled) {
      await scheduleEveningReminder(preset.hour, preset.minute);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.settingsRow}>
        <Text style={styles.settingsLabel}>Dark Mode</Text>
        <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme}>
          <Text style={styles.themeBtnText}>{mode === "dark" ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      </View>

      {notificationsSupported ? (
        <>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          <Text style={styles.subtitle}>
            Two gentle nudges — a verse to start the day, and a moment to reflect as it closes.
          </Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Morning · Word for the day</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.morningReminderEnabled && styles.switchTrackOn]}
                onPress={handleMorningToggle}
              >
                <View style={[styles.switchThumb, settings.morningReminderEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>
            <View style={styles.presetRow}>
              {MORNING_PRESETS.map((preset) => {
                const active =
                  settings.morningReminderHour === preset.hour && settings.morningReminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => handleMorningPreset(preset)}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>Evening · Time to reflect</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.eveningReminderEnabled && styles.switchTrackOn]}
                onPress={handleEveningToggle}
              >
                <View style={[styles.switchThumb, settings.eveningReminderEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>
            <View style={styles.presetRow}>
              {EVENING_PRESETS.map((preset) => {
                const active =
                  settings.eveningReminderHour === preset.hour && settings.eveningReminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => handleEveningPreset(preset)}
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
    </ScrollView>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    container: { padding: 18, paddingBottom: 40 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, color: colors.textSoft },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark, marginBottom: 12, marginTop: 4 },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    settingsLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
    themeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    themeBtnText: { fontSize: 16 },
    settingsCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...shadow,
    },
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
