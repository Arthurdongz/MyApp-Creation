import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme";
import { BADGE_DEFS } from "../storage";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default function RewardsScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { totalStars, streak, momentsDone } = store;

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

      <Text style={styles.sectionTitle}>Mood Calendar</Text>
      <Text style={styles.subtitle}>How you've been feeling, day by day.</Text>
      <MoodCalendar store={store} styles={styles} />
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
  });
}
