import { StyleSheet, Text, View } from "react-native";
import { colors, shadow } from "../theme";
import { BADGE_DEFS } from "../storage";

export default function RewardsScreen({ store }) {
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

      <Text style={styles.badgesTitle}>Badges</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  badgesTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark, marginBottom: 12 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
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
});
