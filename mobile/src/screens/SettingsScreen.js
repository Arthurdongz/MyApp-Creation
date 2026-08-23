import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Speech from "expo-speech";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { exportBackup, pickAndReadBackup } from "../backup";
import { checkForUpdateManually } from "../updates";
import { speak } from "../speech";
import { hapticTap } from "../haptics";
import { todayKey } from "../content";
import { BIBLE_VERSIONS } from "../data/verses";
import { CRISIS_REGION_LABELS, OTHER_REGION, sortedCrisisRegionCodes } from "../crisisResources";
import {
  scheduleMorningReminder,
  cancelMorningReminder,
  scheduleHighlightReminder,
  cancelHighlightReminder,
  scheduleEveningReminder,
  cancelEveningReminder,
  scheduleConfessionReminder,
  cancelConfessionReminder,
  notificationsSupported,
} from "../notifications";

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function daysSince(key) {
  const [y, m, d] = key.split("-").map(Number);
  const from = new Date(y, m - 1, d);
  const to = new Date();
  to.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  return Math.round((to - from) / 86400000);
}

const PRIVACY_POLICY_URL = "https://arthurdongz.github.io/MyApp-Creation/privacy-policy.html";

const PITCH_PRESET_VALUES = [
  { key: "lower", value: 0.8 },
  { key: "normal", value: 1.0 },
  { key: "higher", value: 1.3 },
];

const RATE_PRESET_VALUES = [
  { key: "slower", value: 0.75 },
  { key: "normal", value: 0.95 },
  { key: "faster", value: 1.15 },
  { key: "fastest", value: 1.4 },
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

const HIGHLIGHT_PRESETS = [
  { label: "11:00 AM", hour: 11, minute: 0 },
  { label: "1:00 PM", hour: 13, minute: 0 },
  { label: "3:00 PM", hour: 15, minute: 0 },
  { label: "5:00 PM", hour: 17, minute: 0 },
];

const CONFESSION_PRESETS = [
  { label: "6:00 AM", hour: 6, minute: 0 },
  { label: "7:00 AM", hour: 7, minute: 0 },
  { label: "8:00 AM", hour: 8, minute: 0 },
  { label: "9:00 AM", hour: 9, minute: 0 },
];

export default function SettingsScreen({ store, onClose }) {
  const { colors, shadow, mode, toggleTheme } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const { settings, updateSettings } = store;
  const [section, setSection] = useState(null);
  const [backupMsg, setBackupMsg] = useState("");
  const [voices, setVoices] = useState([]);
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckForUpdates = async () => {
    if (checkingUpdate) return;
    hapticTap();
    setCheckingUpdate(true);
    const result = await checkForUpdateManually();
    setCheckingUpdate(false);
    if (result.status === "upToDate") {
      Alert.alert(t("app.upToDateTitle"), t("app.upToDateMessage"));
    } else if (result.status === "error") {
      Alert.alert(t("app.updateCheckErrorTitle"), t("app.updateCheckErrorMessage"));
    } else if (result.status === "unsupported") {
      Alert.alert(t("app.updateCheckUnsupportedTitle"), t("app.updateCheckUnsupportedMessage"));
    }
    // "reloading" means Updates.reloadAsync() already fired — the app is
    // restarting, so there's nothing left to show here.
  };

  const pitchPresetLabel = (key) => (key === "normal" ? t("common.normal") : t(`settings.pitchPresets.${key}`));
  const ratePresetLabel = (key) => (key === "normal" ? t("common.normal") : t(`settings.ratePresets.${key}`));
  const PITCH_PRESETS = PITCH_PRESET_VALUES.map((p) => ({ ...p, label: pitchPresetLabel(p.key) }));
  const RATE_PRESETS = RATE_PRESET_VALUES.map((p) => ({ ...p, label: ratePresetLabel(p.key) }));

  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then(setVoices)
      .catch(() => setVoices([]));
  }, []);

  const selectedVoiceName =
    voices.find((v) => v.identifier === settings.speechVoiceURI)?.name || t("settings.defaultVoiceName");

  const showBackupMsg = (text) => {
    setBackupMsg(text);
    setTimeout(() => setBackupMsg(""), 4000);
  };

  const handleExport = async () => {
    try {
      await exportBackup(store.state);
      updateSettings({ lastBackupAt: todayKey() });
    } catch (e) {
      showBackupMsg(t("settings.exportError"));
    }
  };

  const handleImport = async () => {
    try {
      const incoming = await pickAndReadBackup();
      if (!incoming) return;
      store.restoreFromBackup(incoming);
      showBackupMsg(t("settings.importSuccess"));
    } catch (e) {
      showBackupMsg(e.message || t("settings.importError"));
    }
  };

  const handleMorningToggle = async () => {
    hapticTap();
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
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleMorningPreset = async (preset) => {
    if (!settings.morningReminderEnabled) {
      updateSettings({ morningReminderHour: preset.hour, morningReminderMinute: preset.minute });
      return;
    }
    const ok = await scheduleMorningReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order, settings);
    if (ok) {
      updateSettings({ morningReminderHour: preset.hour, morningReminderMinute: preset.minute });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleHighlightToggle = async () => {
    hapticTap();
    if (settings.highlightReminderEnabled) {
      await cancelHighlightReminder();
      updateSettings({ highlightReminderEnabled: false });
      return;
    }
    const ok = await scheduleHighlightReminder(
      settings.highlightReminderHour,
      settings.highlightReminderMinute,
      store.state.journeyStartDate,
      store.order
    );
    if (ok) {
      updateSettings({ highlightReminderEnabled: true });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleHighlightPreset = async (preset) => {
    if (!settings.highlightReminderEnabled) {
      updateSettings({ highlightReminderHour: preset.hour, highlightReminderMinute: preset.minute });
      return;
    }
    const ok = await scheduleHighlightReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order);
    if (ok) {
      updateSettings({ highlightReminderHour: preset.hour, highlightReminderMinute: preset.minute });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleEveningToggle = async () => {
    hapticTap();
    if (settings.eveningReminderEnabled) {
      await cancelEveningReminder();
      updateSettings({ eveningReminderEnabled: false });
      return;
    }
    const ok = await scheduleEveningReminder(
      settings.eveningReminderHour,
      settings.eveningReminderMinute,
      store.state.journeyStartDate,
      store.order
    );
    if (ok) {
      updateSettings({ eveningReminderEnabled: true });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleEveningPreset = async (preset) => {
    if (!settings.eveningReminderEnabled) {
      updateSettings({ eveningReminderHour: preset.hour, eveningReminderMinute: preset.minute });
      return;
    }
    const ok = await scheduleEveningReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order);
    if (ok) {
      updateSettings({ eveningReminderHour: preset.hour, eveningReminderMinute: preset.minute });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleConfessionToggle = async () => {
    hapticTap();
    if (settings.confessionReminderEnabled) {
      await cancelConfessionReminder();
      updateSettings({ confessionReminderEnabled: false });
      return;
    }
    const ok = await scheduleConfessionReminder(
      settings.confessionReminderHour,
      settings.confessionReminderMinute,
      store.state.journeyStartDate,
      store.order
    );
    if (ok) {
      updateSettings({ confessionReminderEnabled: true });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const handleConfessionPreset = async (preset) => {
    if (!settings.confessionReminderEnabled) {
      updateSettings({ confessionReminderHour: preset.hour, confessionReminderMinute: preset.minute });
      return;
    }
    const ok = await scheduleConfessionReminder(preset.hour, preset.minute, store.state.journeyStartDate, store.order);
    if (ok) {
      updateSettings({ confessionReminderHour: preset.hour, confessionReminderMinute: preset.minute });
    } else {
      Alert.alert(t("settings.notifDisabledTitle"), t("settings.notifDisabledMessage"));
    }
  };

  const backupSubtitle = settings.lastBackupAt
    ? daysSince(settings.lastBackupAt) >= 30
      ? t("settings.backupNote.overdue", {
          days: daysSince(settings.lastBackupAt),
          date: formatDate(settings.lastBackupAt),
        })
      : t("settings.backupNote.recent", { date: formatDate(settings.lastBackupAt) })
    : t("settings.backupNote.never");

  const favoriteVersion = BIBLE_VERSIONS.find((v) => v.id === (settings.verseFavoriteVersion || "KJV"));
  const bibleVersionSubtitle =
    settings.verseVersionMode === "favorite" && favoriteVersion
      ? `${favoriteVersion.name} (${favoriteVersion.id})`
      : t("settings.verseModeAlternate");

  const crisisRegionSubtitle = !settings.crisisRegionOverride
    ? t("settings.crisisRegionAuto")
    : settings.crisisRegionOverride === OTHER_REGION
    ? t("settings.crisisRegionOther")
    : CRISIS_REGION_LABELS[settings.crisisRegionOverride] || t("settings.crisisRegionAuto");

  const remindersOnCount = [
    settings.morningReminderEnabled,
    settings.highlightReminderEnabled,
    settings.eveningReminderEnabled,
    settings.confessionReminderEnabled,
  ].filter(Boolean).length;

  const MENU_ITEMS = [
    {
      key: "appearance",
      emoji: "🎨",
      title: t("settings.appearanceTitle"),
      subtitle: mode === "dark" ? t("settings.subtitleDark") : t("settings.subtitleLight"),
    },
    { key: "bibleVersion", emoji: "📖", title: t("settings.bibleVersionTitle"), subtitle: bibleVersionSubtitle },
    { key: "crisisRegion", emoji: "🌍", title: t("settings.crisisRegionTitle"), subtitle: crisisRegionSubtitle },
    { key: "voiceSpeech", emoji: "🔊", title: t("settings.voiceSpeechTitle"), subtitle: selectedVoiceName },
    ...(notificationsSupported
      ? [
          {
            key: "reminders",
            emoji: "⏰",
            title: t("settings.remindersTitle"),
            subtitle: t("settings.remindersSummary", { count: remindersOnCount, total: 4 }),
          },
        ]
      : []),
    { key: "backup", emoji: "💾", title: t("settings.backupTitle"), subtitle: backupSubtitle },
  ];

  const headerTitle = section ? MENU_ITEMS.find((item) => item.key === section)?.title : t("settings.title");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {section ? (
            <TouchableOpacity
              onPress={() => setSection(null)}
              style={styles.backBtn}
              accessibilityLabel={t("settings.backLabel")}
              accessibilityRole="button"
            >
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.title} numberOfLines={1}>
            {headerTitle}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("settings.closeLabel")} accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {section === null ? (
        <View>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuRow}
              onPress={() => {
                hapticTap();
                setSection(item.key);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.subtitle}`}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.menuSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleCheckForUpdates}
            disabled={checkingUpdate}
            accessibilityRole="button"
            accessibilityLabel={`${t("settings.checkUpdatesTitle")}. ${t("settings.checkUpdatesSubtitle")}`}
          >
            <Text style={styles.menuEmoji}>🔄</Text>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>{t("settings.checkUpdatesTitle")}</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>
                {checkingUpdate ? t("settings.checkingUpdates") : t("settings.checkUpdatesSubtitle")}
              </Text>
            </View>
            {checkingUpdate ? <ActivityIndicator size="small" color={colors.sageDark} /> : <Text style={styles.menuChevron}>›</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} style={styles.footerLinkWrap}>
            <Text style={styles.footerLink}>{t("common.privacyPolicy")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {section === "appearance" ? (
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>{t("settings.darkMode")}</Text>
          <TouchableOpacity
            style={styles.themeBtn}
            onPress={toggleTheme}
            accessibilityLabel={mode === "dark" ? t("settings.switchToLight") : t("settings.switchToDark")}
            accessibilityRole="button"
          >
            <Text style={styles.themeBtnText}>{mode === "dark" ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {section === "bibleVersion" ? (
        <View>
          <Text style={styles.subtitle}>{t("settings.bibleVersionSubtitle")}</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={[styles.presetBtn, settings.verseVersionMode !== "favorite" && styles.presetBtnActive]}
              onPress={() => {
                hapticTap();
                updateSettings({ verseVersionMode: "alternate" });
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.verseVersionMode !== "favorite" }}
            >
              <Text style={[styles.presetText, settings.verseVersionMode !== "favorite" && styles.presetTextActive]}>
                {t("settings.verseModeAlternate")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetBtn, settings.verseVersionMode === "favorite" && styles.presetBtnActive]}
              onPress={() => {
                hapticTap();
                updateSettings({ verseVersionMode: "favorite" });
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.verseVersionMode === "favorite" }}
            >
              <Text style={[styles.presetText, settings.verseVersionMode === "favorite" && styles.presetTextActive]}>
                {t("settings.verseModeFavorite")}
              </Text>
            </TouchableOpacity>
          </View>
          {settings.verseVersionMode === "favorite" ? (
            <View style={[styles.presetRow, { marginTop: 12 }]}>
              {BIBLE_VERSIONS.map((v) => {
                const active = (settings.verseFavoriteVersion || "KJV") === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => {
                      hapticTap();
                      updateSettings({ verseFavoriteVersion: v.id });
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>
                      {v.name} ({v.id})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}

      {section === "crisisRegion" ? (
        <View>
          <Text style={styles.subtitle}>{t("settings.crisisRegionSubtitle")}</Text>
          <View style={styles.listCard}>
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => {
                hapticTap();
                updateSettings({ crisisRegionOverride: null });
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: !settings.crisisRegionOverride }}
            >
              <Text style={[styles.listRowText, !settings.crisisRegionOverride && styles.listRowTextActive]}>
                {t("settings.crisisRegionAuto")}
              </Text>
              {!settings.crisisRegionOverride ? <Text style={styles.listRowCheck}>✓</Text> : null}
            </TouchableOpacity>
            {sortedCrisisRegionCodes().map((code) => {
              const active = settings.crisisRegionOverride === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={styles.listRow}
                  onPress={() => {
                    hapticTap();
                    updateSettings({ crisisRegionOverride: code });
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.listRowText, active && styles.listRowTextActive]}>
                    {CRISIS_REGION_LABELS[code]}
                  </Text>
                  {active ? <Text style={styles.listRowCheck}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.listRow, styles.listRowLast]}
              onPress={() => {
                hapticTap();
                updateSettings({ crisisRegionOverride: OTHER_REGION });
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.crisisRegionOverride === OTHER_REGION }}
            >
              <Text
                style={[
                  styles.listRowText,
                  settings.crisisRegionOverride === OTHER_REGION && styles.listRowTextActive,
                ]}
              >
                {t("settings.crisisRegionOther")}
              </Text>
              {settings.crisisRegionOverride === OTHER_REGION ? <Text style={styles.listRowCheck}>✓</Text> : null}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {section === "voiceSpeech" ? (
        <View>
          <Text style={styles.subtitle}>{t("settings.voiceSpeechSubtitle", { listenLabel: t("common.listen") })}</Text>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>{t("settings.voiceLabel")}</Text>
            <TouchableOpacity
              style={styles.voiceValueBtn}
              onPress={() => setVoicePickerOpen(true)}
              accessibilityLabel={t("settings.voiceValueLabel", { voice: selectedVoiceName })}
              accessibilityRole="button"
            >
              <Text style={styles.voiceValueText} numberOfLines={1}>
                {selectedVoiceName} ›
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.settingsLabel}>{t("settings.pitchLabel")}</Text>
          <View style={styles.presetRow}>
            {PITCH_PRESETS.map((preset) => {
              const active = settings.speechPitch === preset.value;
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => updateSettings({ speechPitch: preset.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.settingsLabel, { marginTop: 14 }]}>{t("settings.speedLabel")}</Text>
          <View style={styles.presetRow}>
            {RATE_PRESETS.map((preset) => {
              const active = settings.speechRate === preset.value;
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => updateSettings({ speechRate: preset.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.testVoiceBtn}
            onPress={() => speak(t("settings.testVoiceSpeech"), settings)}
          >
            <Text style={styles.testVoiceBtnText}>{t("settings.testVoiceButton")}</Text>
          </TouchableOpacity>

          <Modal visible={voicePickerOpen} animationType="slide" transparent onRequestClose={() => setVoicePickerOpen(false)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <View style={styles.header}>
                  <Text style={styles.title}>{t("settings.voicePickerTitle")}</Text>
                  <TouchableOpacity
                    onPress={() => setVoicePickerOpen(false)}
                    style={styles.closeBtn}
                    accessibilityLabel={t("settings.closeVoicePickerLabel")}
                    accessibilityRole="button"
                  >
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: !settings.speechVoiceURI }}
                  >
                    <Text style={[styles.voiceRowText, !settings.speechVoiceURI && styles.voiceRowTextActive]}>
                      {t("settings.defaultVoiceName")}
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: settings.speechVoiceURI === v.identifier }}
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
        </View>
      ) : null}

      {section === "reminders" && notificationsSupported ? (
        <View>
          <Text style={styles.subtitle}>{t("settings.remindersSubtitle")}</Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>{t("settings.confessionLabel")}</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.confessionReminderEnabled && styles.switchTrackOn]}
                onPress={handleConfessionToggle}
                accessibilityRole="switch"
                accessibilityLabel={t("settings.confessionSwitchLabel")}
                accessibilityState={{ checked: !!settings.confessionReminderEnabled }}
              >
                <View style={[styles.switchThumb, settings.confessionReminderEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>
            <View style={styles.presetRow}>
              {CONFESSION_PRESETS.map((preset) => {
                const active =
                  settings.confessionReminderHour === preset.hour &&
                  settings.confessionReminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => handleConfessionPreset(preset)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>{t("settings.morningLabel")}</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.morningReminderEnabled && styles.switchTrackOn]}
                onPress={handleMorningToggle}
                accessibilityRole="switch"
                accessibilityLabel={t("settings.morningSwitchLabel")}
                accessibilityState={{ checked: !!settings.morningReminderEnabled }}
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>{t("settings.highlightLabel")}</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.highlightReminderEnabled && styles.switchTrackOn]}
                onPress={handleHighlightToggle}
                accessibilityRole="switch"
                accessibilityLabel={t("settings.highlightSwitchLabel")}
                accessibilityState={{ checked: !!settings.highlightReminderEnabled }}
              >
                <View style={[styles.switchThumb, settings.highlightReminderEnabled && styles.switchThumbOn]} />
              </TouchableOpacity>
            </View>
            <View style={styles.presetRow}>
              {HIGHLIGHT_PRESETS.map((preset) => {
                const active =
                  settings.highlightReminderHour === preset.hour &&
                  settings.highlightReminderMinute === preset.minute;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[styles.presetBtn, active && styles.presetBtnActive]}
                    onPress={() => handleHighlightPreset(preset)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsLabel}>{t("settings.eveningLabel")}</Text>
              <TouchableOpacity
                style={[styles.switchTrack, settings.eveningReminderEnabled && styles.switchTrackOn]}
                onPress={handleEveningToggle}
                accessibilityRole="switch"
                accessibilityLabel={t("settings.eveningSwitchLabel")}
                accessibilityState={{ checked: !!settings.eveningReminderEnabled }}
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      ) : null}

      {section === "backup" ? (
        <View>
          <Text style={styles.subtitle}>{t("settings.backupSubtitle")}</Text>
          <Text style={styles.backupNote}>{backupSubtitle}</Text>
          <View style={styles.backupRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExport}>
              <Text style={styles.secondaryBtnText}>{t("settings.exportBackup")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport}>
              <Text style={styles.secondaryBtnText}>{t("settings.restoreBackup")}</Text>
            </TouchableOpacity>
          </View>
          {backupMsg ? <Text style={styles.backupMsg}>{backupMsg}</Text> : null}
        </View>
      ) : null}
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
    headerLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12, gap: 10 },
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, flexShrink: 1 },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    backBtnText: { fontSize: 20, fontWeight: "700", color: colors.sageDark, marginTop: -2 },
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
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuEmoji: { fontSize: 20, width: 32 },
    menuTextWrap: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
    menuSubtitle: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
    menuChevron: { fontSize: 20, color: colors.textSoft, marginLeft: 8 },
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
    presetBtnActive: { backgroundColor: colors.buttonBg, borderColor: colors.buttonBg },
    presetText: { fontSize: 12, fontWeight: "600", color: colors.textSoft },
    presetTextActive: { color: colors.buttonOnText },
    listCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: "hidden",
      marginTop: 4,
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    listRowLast: { borderBottomWidth: 0 },
    listRowText: { fontSize: 14, color: colors.text },
    listRowTextActive: { color: colors.sageDark, fontWeight: "700" },
    listRowCheck: { fontSize: 16, color: colors.sageDark, fontWeight: "700" },
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
    backupNote: { fontSize: 13, color: colors.textSoft, marginBottom: 12 },
    footerLinkWrap: { marginTop: 8, alignItems: "center" },
    footerLink: { fontSize: 13, color: colors.textSoft, textDecorationLine: "underline" },
  });
}
