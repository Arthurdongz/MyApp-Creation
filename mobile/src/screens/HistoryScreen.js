import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function HistoryScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const entries = store.state.entries;
  const keys = Object.keys(entries)
    .filter((k) => {
      const e = entries[k];
      return e.reflection || e.barnabasNote || e.momentDone;
    })
    .sort((a, b) => entries[b].dayNumber - entries[a].dayNumber);

  return (
    <View>
      <Text style={styles.title}>My Journal</Text>
      <Text style={styles.subtitle}>Every entry you've written, kept in one quiet place.</Text>

      {keys.length === 0 ? (
        <Text style={styles.empty}>
          Your journal is still quiet — write your first reflection on the Today tab.
        </Text>
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
