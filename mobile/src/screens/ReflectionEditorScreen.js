// Dedicated full-screen editor for one day's reflection — reached either
// from the "Write Today's Reflection" card or by tapping a past entry on
// the Journal tab, and from the slim teaser Today keeps at its own bottom.
// Always shows exactly one day's three fields (never a list, never
// another day's content), the same navigation pattern Settings/About/the
// Bible browser already use: a full screen swapped in over the tab bar,
// not an inline expansion.
//
// The store's reflection fields (today/saveReflection/setMood) are all
// scoped to its single shared "viewingDay" cursor — the same one Today's
// own prev/next-day navigation moves. Opening this screen moves that
// cursor to the day being edited so the existing store functions just
// work; closing restores whatever it was before, so it never leaks a
// jump into what the Today tab shows afterward.
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticSuccess, hapticTap } from "../haptics";
import { pickForDaySmallBank } from "../content";
import { JOURNAL_PROMPTS } from "../data/journalPrompts";
import { JOURNAL_PROMPTS_ES } from "../data/journalPrompts.es";
import { JOURNAL_PROMPTS_PT } from "../data/journalPrompts.pt";
import { JOURNAL_PROMPTS_FR } from "../data/journalPrompts.fr";

const JOURNAL_PROMPTS_BY_LANG = { es: JOURNAL_PROMPTS_ES, pt: JOURNAL_PROMPTS_PT, fr: JOURNAL_PROMPTS_FR };

const MOOD_KEYS = [
  { key: "joyful", emoji: "😊" },
  { key: "peaceful", emoji: "🙂" },
  { key: "hopeful", emoji: "🌱" },
  { key: "tired", emoji: "😔" },
  { key: "struggling", emoji: "😢" },
];

function formatDate(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function ReflectionEditorScreen({ store, dayNumber, onClose }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const MOODS = MOOD_KEYS.map((m) => ({ ...m, label: t(`common.moods.${m.key}`) }));
  const journalPromptsBank = JOURNAL_PROMPTS_BY_LANG[i18n.language] || JOURNAL_PROMPTS;
  const journalPrompt = useMemo(
    () => pickForDaySmallBank(journalPromptsBank, dayNumber, store.order),
    [journalPromptsBank, dayNumber, store.order]
  );

  const isTodayTarget = dayNumber >= store.latestDay;
  const previousViewingDayRef = useRef(store.viewingDay);

  useEffect(() => {
    store.jumpToDay(dayNumber);
    // Intentionally only on mount — this screen edits exactly one day for
    // its whole lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [reflection, setReflection] = useState(store.today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(store.today.barnabasNote || "");
  const [receivedKindness, setReceivedKindness] = useState(store.today.receivedKindness || "");
  const [encouragedWho, setEncouragedWho] = useState(store.today.encouragedWho || "");
  const [showSaved, setShowSaved] = useState(false);

  // store.today only reflects dayNumber once the jump above has actually
  // taken effect (a render or two after mount) — sync the fields the
  // first time that happens, same pattern Today's own day-navigation uses.
  const syncedRef = useRef(false);
  useEffect(() => {
    if (store.viewingDay !== dayNumber) return;
    if (syncedRef.current) return;
    syncedRef.current = true;
    setReflection(store.today.reflection || "");
    setBarnabasNote(store.today.barnabasNote || "");
    setReceivedKindness(store.today.receivedKindness || "");
    setEncouragedWho(store.today.encouragedWho || "");
  }, [store.viewingDay, store.today, dayNumber]);

  const fieldsRef = useRef({ reflection, barnabasNote, receivedKindness, encouragedWho });
  fieldsRef.current = { reflection, barnabasNote, receivedKindness, encouragedWho };

  const handleClose = () => {
    const { reflection: r, barnabasNote: b, receivedKindness: k, encouragedWho: w } = fieldsRef.current;
    if (r.trim() || b.trim() || k.trim() || w.trim()) {
      store.saveReflection(r, b, k, w);
    }
    store.jumpToDay(previousViewingDayRef.current);
    onClose();
  };

  const handleSave = () => {
    store.saveReflection(reflection, barnabasNote, receivedKindness, encouragedWho);
    hapticSuccess();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleMoodPress = (mood) => {
    hapticTap();
    store.setMood(mood);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {isTodayTarget ? t("today.reflect.sectionTitleToday") : t("today.reflect.sectionTitleDay", { day: dayNumber })}
          </Text>
          {store.today.dateLogged ? <Text style={styles.headerSub}>{formatDate(store.today.dateLogged)}</Text> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.field}>
          <View style={styles.fieldHead}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color={colors.sageDark} />
            <Text style={styles.fieldTitle}>{t("today.reflect.heartTitle")}</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder={journalPrompt}
            placeholderTextColor={colors.textSoft}
            value={reflection}
            onChangeText={setReflection}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldHead}>
            <FontAwesome5 name="handshake" size={14} color={colors.sageDark} solid />
            <Text style={styles.fieldTitle}>{t("today.reflect.momentTitle")}</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder={t("today.reflect.momentPlaceholder")}
            placeholderTextColor={colors.textSoft}
            value={barnabasNote}
            onChangeText={setBarnabasNote}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldHead}>
            <Ionicons name="person-outline" size={16} color={colors.sageDark} />
            <Text style={styles.fieldTitle}>{t("today.reflect.whoTitle")}</Text>
          </View>
          <TextInput
            style={styles.textArea}
            numberOfLines={1}
            placeholder={t("today.reflect.whoPlaceholder")}
            placeholderTextColor={colors.textSoft}
            value={encouragedWho}
            onChangeText={setEncouragedWho}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldHead}>
            <Ionicons name="heart" size={16} color={colors.goldText} />
            <Text style={styles.fieldTitle}>{t("today.reflect.kindnessTitle")}</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder={t("today.reflect.kindnessPlaceholder")}
            placeholderTextColor={colors.textSoft}
            value={receivedKindness}
            onChangeText={setReceivedKindness}
          />
        </View>

        <Text style={styles.fieldLabel}>{t("today.reflect.moodLabel")}</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.moodBtn, store.today.mood === m.key && styles.moodBtnSelected]}
              onPress={() => handleMoodPress(m.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: store.today.mood === m.key }}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityRole="button" accessibilityLabel={t("today.reflect.saveLabel")}>
          <Text style={styles.saveBtnText}>{t("today.reflect.saveButton")}</Text>
        </TouchableOpacity>
        {showSaved ? (
          <Text style={styles.savedMsg}>{isTodayTarget ? t("today.reflect.savedToday") : t("today.reflect.savedPastDay")}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
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
    backBtnText: { fontSize: 20, color: colors.textSoft, lineHeight: 20 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: colors.sageDark },
    headerSub: { fontSize: 12, color: colors.textSoft, marginTop: 1 },
    body: { padding: 18, paddingBottom: 44 },
    field: { marginBottom: 18 },
    fieldHead: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 9 },
    fieldTitle: { fontSize: 14, fontWeight: "700", color: colors.text, flex: 1 },
    textArea: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text,
      textAlignVertical: "top",
      minHeight: 60,
    },
    fieldLabel: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 },
    moodRow: { flexDirection: "row", justifyContent: "space-between", gap: 6, marginBottom: 20 },
    moodBtn: {
      flex: 1,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 10,
    },
    moodBtnSelected: { borderColor: colors.sageDark, backgroundColor: colors.verseCard },
    moodEmoji: { fontSize: 20 },
    moodLabel: { fontSize: 10, color: colors.textSoft, marginTop: 3 },
    saveBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    saveBtnText: { color: colors.buttonOnText, fontSize: 15, fontWeight: "700" },
    savedMsg: { textAlign: "center", fontSize: 13, color: colors.sageDark, marginTop: 12 },
  });
}
