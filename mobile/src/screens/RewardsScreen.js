import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { BADGE_DEFS } from "../storage";
import SharePreviewModal from "../components/SharePreviewModal";
import YearReviewCard from "../components/YearReviewCard";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural || `${singular}s`}`;
}

function WeeklyRecapCard({ recap, styles }) {
  if (recap.totalDays < 2) return null;
  return (
    <View style={styles.recapCard}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <Text style={styles.recapText}>
        Over the last {pluralize(recap.totalDays, "day")}, you showed up{" "}
        {pluralize(recap.daysShownUp, "day")}, did {pluralize(recap.momentsDone, "Barnabas Moment")}, and
        wrote {pluralize(recap.journalEntries, "journal entry", "journal entries")}.
      </Text>
      <Text style={[styles.recapText, { marginTop: 8 }]}>
        {recap.kindnessReceived > 0
          ? `And you noticed kindness coming your way ${pluralize(recap.kindnessReceived, "time")} — you're being watered too, not just pouring out.`
          : "He who waters others is himself watered — don't forget to notice when kindness comes your way, too."}
      </Text>
    </View>
  );
}

function YearInReviewCard({ recap, styles, onShare }) {
  if (recap.totalDays < 14) return null;
  const title = recap.isFullYear ? "Your Year in Review" : "Your Journey So Far";
  return (
    <View style={styles.recapCard}>
      <View style={styles.recapHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share your year in review"
        >
          <Text style={styles.recapShareBtn}>↗ Share</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recapText}>
        Over {pluralize(recap.totalDays, "day")}, you showed up {pluralize(recap.daysShownUp, "day")}, did{" "}
        {pluralize(recap.momentsDone, "Barnabas Moment")}, and reached a best streak of{" "}
        {pluralize(recap.longestStreak, "day")} in a row.
      </Text>
      {recap.favoritesSaved > 0 ? (
        <Text style={[styles.recapText, { marginTop: 8 }]}>
          You saved {pluralize(recap.favoritesSaved, "favorite")} along the way to come back to.
        </Text>
      ) : null}
    </View>
  );
}

export default function RewardsScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { totalStars, streak, momentsDone, weeklyRecap, yearInReview, settings, updateSettings } = store;
  const [showYearShare, setShowYearShare] = useState(false);

  return (
    <View>
      <Text style={styles.title}>Rewards</Text>
      <Text style={styles.subtitle}>A small way to notice how far you've come.</Text>

      <WeeklyRecapCard recap={weeklyRecap} styles={styles} />
      <YearInReviewCard recap={yearInReview} styles={styles} onShare={() => setShowYearShare(true)} />

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
            <View
              key={b.id}
              style={[styles.badge, !earned && styles.badgeLocked]}
              accessible
              accessibilityLabel={`${b.name}, ${b.desc}${earned ? "" : ", locked"}`}
            >
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

      <SharePreviewModal
        visible={showYearShare}
        CardComponent={YearReviewCard}
        cardProps={{ stats: yearInReview }}
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setShowYearShare(false)}
      />
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
    recapCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      ...shadow,
    },
    recapText: { fontSize: 14, lineHeight: 20, color: colors.text },
    recapHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    recapShareBtn: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 9,
      overflow: "hidden",
    },
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
