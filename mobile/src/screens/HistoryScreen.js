import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function onThisDaySnippet(t, entries, latestDay) {
  const offsets = [
    { days: 365, key: "yearAgo" },
    { days: 90, key: "threeMonthsAgo" },
    { days: 30, key: "monthAgo" },
    { days: 7, key: "weekAgo" },
  ];
  for (const { days, key } of offsets) {
    const dayNumber = latestDay - days;
    if (dayNumber < 1) continue;
    const entry = entries[`day-${dayNumber}`];
    const snippet = entry && (entry.reflection || entry.barnabasNote || entry.receivedKindness);
    if (snippet) {
      const label = t(`history.onThisDay.${key}`);
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      return t("history.onThisDay.entry", { label: capitalized, day: dayNumber, snippet });
    }
  }
  return null;
}

export default function HistoryScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const entries = store.state.entries;
  const [query, setQuery] = useState("");
  const allKeys = Object.keys(entries)
    .filter((k) => {
      const e = entries[k];
      return e.reflection || e.barnabasNote || e.receivedKindness || e.momentDone;
    })
    .sort((a, b) => entries[b].dayNumber - entries[a].dayNumber);

  const q = query.trim().toLowerCase();
  const keys = q
    ? allKeys.filter((k) => {
        const e = entries[k];
        return (
          (e.reflection && e.reflection.toLowerCase().includes(q)) ||
          (e.barnabasNote && e.barnabasNote.toLowerCase().includes(q)) ||
          (e.receivedKindness && e.receivedKindness.toLowerCase().includes(q))
        );
      })
    : allKeys;

  const onThisDay = onThisDaySnippet(t, entries, store.latestDay);

  return (
    <View>
      <Text style={styles.title}>{t("history.title")}</Text>
      <Text style={styles.subtitle}>{t("history.subtitle")}</Text>

      {onThisDay ? (
        <View style={styles.onThisDayCard}>
          <Text style={styles.onThisDayLabel}>{t("history.onThisDayLabel")}</Text>
          <Text style={styles.onThisDayText}>{onThisDay}</Text>
        </View>
      ) : null}

      {allKeys.length === 0 ? null : (
        <TextInput
          style={styles.searchInput}
          placeholder={t("history.searchPlaceholder")}
          placeholderTextColor={colors.textSoft}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel={t("history.searchPlaceholder")}
        />
      )}

      {allKeys.length === 0 ? (
        <Text style={styles.empty}>{t("history.emptyNoEntries")}</Text>
      ) : keys.length === 0 ? (
        <Text style={styles.empty}>{t("history.emptySearch")}</Text>
      ) : (
        keys.map((key) => {
          const e = entries[key];
          return (
            <View key={key} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>
                  {t("history.entryDate", { day: e.dayNumber, date: formatDate(e.dateLogged) })}
                </Text>
                <Text
                  style={styles.entryMood}
                  accessibilityLabel={e.mood ? t("history.moodLabel", { mood: t(`common.moods.${e.mood}`) }) : undefined}
                >
                  {e.mood ? MOOD_EMOJI[e.mood] : ""}
                </Text>
              </View>
              {e.reflection ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>{t("history.blockLabels.reflection")}</Text>
                  <Text style={styles.blockText}>{e.reflection}</Text>
                </View>
              ) : null}
              {e.barnabasNote ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>{t("history.blockLabels.barnabasMoment")}</Text>
                  <Text style={styles.blockText}>{e.barnabasNote}</Text>
                </View>
              ) : null}
              {e.momentDone && !e.barnabasNote ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>{t("history.blockLabels.barnabasMoment")}</Text>
                  <Text style={styles.blockText}>{t("history.markedDone")}</Text>
                </View>
              ) : null}
              {e.receivedKindness ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>{t("history.blockLabels.kindnessReceived")}</Text>
                  <Text style={styles.blockText}>{e.receivedKindness}</Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 18 },
    empty: { fontSize: 14, color: colors.textSoft, textAlign: "center", paddingVertical: 30 },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.input,
      marginBottom: 16,
    },
    onThisDayCard: {
      backgroundColor: colors.momentCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      ...shadow,
    },
    onThisDayLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontSize: 11,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 8,
    },
    onThisDayText: { fontSize: 14, lineHeight: 20, color: colors.text },
    entryCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...shadow,
    },
    entryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    entryDate: { fontWeight: "700", fontSize: 13, color: colors.sageDark },
    entryMood: { fontSize: 18 },
    block: { marginTop: 8 },
    blockLabel: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.textSoft,
      fontWeight: "700",
      marginBottom: 2,
    },
    blockText: { fontSize: 14, color: colors.text },
  });
}
