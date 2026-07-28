import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "../theme";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function onThisDaySnippet(entries, latestDay) {
  const offsets = [
    { days: 365, label: "a year ago" },
    { days: 90, label: "three months ago" },
    { days: 30, label: "a month ago" },
    { days: 7, label: "a week ago" },
  ];
  for (const { days, label } of offsets) {
    const dayNumber = latestDay - days;
    if (dayNumber < 1) continue;
    const entry = entries[`day-${dayNumber}`];
    const snippet = entry && (entry.reflection || entry.barnabasNote);
    if (snippet) {
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      return `${capitalized} (Day ${dayNumber}), you wrote: "${snippet}"`;
    }
  }
  return null;
}

export default function HistoryScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const entries = store.state.entries;
  const [query, setQuery] = useState("");
  const allKeys = Object.keys(entries)
    .filter((k) => {
      const e = entries[k];
      return e.reflection || e.barnabasNote || e.momentDone;
    })
    .sort((a, b) => entries[b].dayNumber - entries[a].dayNumber);

  const q = query.trim().toLowerCase();
  const keys = q
    ? allKeys.filter((k) => {
        const e = entries[k];
        return (
          (e.reflection && e.reflection.toLowerCase().includes(q)) ||
          (e.barnabasNote && e.barnabasNote.toLowerCase().includes(q))
        );
      })
    : allKeys;

  const onThisDay = onThisDaySnippet(entries, store.latestDay);

  return (
    <View>
      <Text style={styles.title}>My Journal</Text>
      <Text style={styles.subtitle}>Every entry you've written, kept in one quiet place.</Text>

      {onThisDay ? (
        <View style={styles.onThisDayCard}>
          <Text style={styles.onThisDayLabel}>On This Day</Text>
          <Text style={styles.onThisDayText}>{onThisDay}</Text>
        </View>
      ) : null}

      {allKeys.length === 0 ? null : (
        <TextInput
          style={styles.searchInput}
          placeholder="Search your journal..."
          placeholderTextColor={colors.textSoft}
          value={query}
          onChangeText={setQuery}
        />
      )}

      {allKeys.length === 0 ? (
        <Text style={styles.empty}>
          Your journal is still quiet — write your first reflection on the Today tab.
        </Text>
      ) : keys.length === 0 ? (
        <Text style={styles.empty}>No entries match your search.</Text>
      ) : (
        keys.map((key) => {
          const e = entries[key];
          return (
            <View key={key} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>Day {e.dayNumber} · {formatDate(e.dateLogged)}</Text>
                <Text style={styles.entryMood}>{e.mood ? MOOD_EMOJI[e.mood] : ""}</Text>
              </View>
              {e.reflection ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Reflection</Text>
                  <Text style={styles.blockText}>{e.reflection}</Text>
                </View>
              ) : null}
              {e.barnabasNote ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Barnabas Moment</Text>
                  <Text style={styles.blockText}>{e.barnabasNote}</Text>
                </View>
              ) : null}
              {e.momentDone && !e.barnabasNote ? (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Barnabas Moment</Text>
                  <Text style={styles.blockText}>Marked as done.</Text>
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
