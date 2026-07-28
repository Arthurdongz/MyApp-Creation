import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Speech from "expo-speech";
import { useTheme } from "../theme";
import { exportBackup, pickAndReadBackup } from "../backup";
import { speak } from "../speech";
import {
  scheduleMorningReminder,
  cancelMorningReminder,
  scheduleEveningReminder,
  cancelEveningReminder,
  notificationsSupported,
} from "../notifications";

const PITCH_PRESETS = [
  { label: "Lower", value: 0.8 },
  { label: "Normal", value: 1.0 },
  { label: "Higher", value: 1.3 },
];

const RATE_PRESETS = [
  { label: "Slower", value: 0.75 },
  { label: "Normal", value: 0.95 },
  { label: "Faster", value: 1.15 },
  { label: "Fastest", value: 1.4 },
];

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
  const [voices, setVoices] = useState([]);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);

  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then(setVoices)
      .catch(() => setVoices([]));
  }, []);

  const selectedVoiceName =
    voices.find((v) => v.identifier === settings.speechVoiceURI)?.name || "Default";

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

      <Text style={styles.sectionTitle}>Voice &amp; Speech</Text>
      <Text style={styles.subtitle}>Choose how the 🔊 Listen buttons sound.</Text>

      <View style={styles.settingsRow}>
        <Text style={styles.settingsLabel}>Voice</Text>
        <TouchableOpacity style={styles.voiceValueBtn} onPress={() => setVoicePickerOpen(true)}>
          <Text style={styles.voiceValueText} numberOfLines={1}>
            {selectedVoiceName} ›
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.settingsLabel}>Pitch</Text>
      <View style={styles.presetRow}>
        {PITCH_PRESETS.map((preset) => {
          const active = settings.speechPitch === preset.value;
          return (
            <TouchableOpacity
              key={preset.label}
              style={[styles.presetBtn, active && styles.presetBtnActive]}
              onPress={() => updateSettings({ speechPitch: preset.value })}
            >
              <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.settingsLabel, { marginTop: 14 }]}>Speed</Text>
      <View style={styles.presetRow}>
        {RATE_PRESETS.map((preset) => {
          const active = settings.speechRate === preset.value;
          return (
            <TouchableOpacity
              key={preset.label}
              style={[styles.presetBtn, active && styles.presetBtnActive]}
              onPress={() => updateSettings({ speechRate: preset.value })}
            >
              <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.testVoiceBtn}
        onPress={() => speak("This is what the voice will sound like when reading your verse or story aloud.", settings)}
      >
        <Text style={styles.testVoiceBtnText}>🔊 Test Voice</Text>
      </TouchableOpacity>

      <Modal visible={voicePickerOpen} animationType="slide" transparent onRequestClose={() => setVoicePickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Choose a Voice</Text>
              <TouchableOpacity onPress={() => setVoicePickerOpen(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.voiceList}>
              <TouchableOpacity
                style={styles.voiceRow}
                onPress={() => {
                  updateSettings({ speechVoiceURI: "" });
                  setVoicePickerOpen(false);
                }}
              >
                <Text style={[styles.voiceRowText, !settings.speechVoiceURI && styles.voiceRowTextActive]}>
                  Default
                </Text>
              </TouchableOpacity>
              {voices.map((v) => (
                <TouchableOpacity
                  key={v.identifier}
                  style={styles.voiceRow}
                  onPress={() => {
                    updateSettings({ speechVoiceURI: v.identifier });
                    setVoicePickerOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.voiceRowText,
                      settings.speechVoiceURI === v.identifier && styles.voiceRowTextActive,
                    ]}
                  >
                    {v.name} ({v.language})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    voiceValueBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 14,
      maxWidth: 220,
    },
    voiceValueText: { fontSize: 13, fontWeight: "600", color: colors.sageDark },
    testVoiceBtn: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    testVoiceBtnText: { color: colors.sageDark, fontWeight: "700", fontSize: 14 },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(20, 24, 18, 0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: "100%",
      maxWidth: 420,
      maxHeight: "75%",
      ...shadow,
    },
    voiceList: { marginTop: 4 },
    voiceRow: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    voiceRowText: { fontSize: 14, color: colors.text },
    voiceRowTextActive: { color: colors.sageDark, fontWeight: "700" },
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
