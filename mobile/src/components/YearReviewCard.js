import { forwardRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Rendered off-screen and captured to an image for sharing, the same way
// ShareQuoteCard is — see SharePreviewModal's CardComponent prop. Fixed at
// 360x420 (taller than the quote card, to fit a 2x2 stat grid + title).
const YearReviewCard = forwardRef(function YearReviewCard({ stats, colors }, ref) {
  const title = stats?.isFullYear ? "My Year with Barnabas Journal" : "My Journey So Far";
  const tiles = [
    { label: "Days Shown Up", value: stats?.daysShownUp ?? 0 },
    { label: "Barnabas Moments", value: stats?.momentsDone ?? 0 },
    { label: "Best Streak", value: stats?.longestStreak ?? 0 },
    { label: "Favorites Saved", value: stats?.favoritesSaved ?? 0 },
  ];

  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <LinearGradient
        colors={colors || ["#f7dca3", "#6f9578"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.grid}>
          {tiles.map((t) => (
            <View key={t.label} style={styles.tile}>
              <Text style={styles.tileNumber}>{t.value}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.watermark}>✦ Barnabas Journal</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 360,
    height: 420,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 28, alignItems: "center" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#3a3a34",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  tile: {
    width: 130,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  tileNumber: { fontSize: 28, fontWeight: "800", color: "#3a3a34" },
  tileLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3f5548",
    marginTop: 4,
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    bottom: 20,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(58,58,52,0.55)",
  },
});

export default YearReviewCard;
