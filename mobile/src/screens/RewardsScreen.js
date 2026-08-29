import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { BADGE_DEFS } from "../storage";
import SharePreviewModal from "../components/SharePreviewModal";
import YearReviewCard from "../components/YearReviewCard";
import AppIcon from "../components/AppIcon";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

// Renders a pluralized "{{count}} unit" phrase (e.g. "3 days") via the
// rewards.units en/es keys, for interpolating into a larger sentence below.
function unit(t, key, count) {
  return t(`rewards.units.${key}`, { count });
}

function WeeklyRecapCard({ recap, styles }) {
  const { t } = useTranslation();
  if (recap.totalDays < 2) return null;
  return (
    <View style={styles.recapCard}>
      <Text style={styles.sectionTitle}>{t("rewards.weeklyRecap.title")}</Text>
      <Text style={styles.recapText}>
        {t("rewards.weeklyRecap.summary", {
          days: unit(t, "day", recap.totalDays),
          shownUp: unit(t, "day", recap.daysShownUp),
          moments: unit(t, "barnabasMoment", recap.momentsDone),
          entries: unit(t, "journalEntry", recap.journalEntries),
        })}
      </Text>
      <Text style={[styles.recapText, { marginTop: 8 }]}>
        {recap.kindnessReceived > 0
          ? t("rewards.weeklyRecap.kindnessNoticed", { times: unit(t, "time", recap.kindnessReceived) })
          : t("rewards.weeklyRecap.kindnessDefault")}
      </Text>
    </View>
  );
}

function YearInReviewCard({ recap, styles, onShare }) {
  const { t } = useTranslation();
  if (recap.totalDays < 14) return null;
  const title = recap.isFullYear ? t("rewards.yearInReview.titleFull") : t("rewards.yearInReview.titlePartial");
  return (
    <View style={styles.recapCard}>
      <View style={styles.recapHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel={t("rewards.yearInReview.shareLabel")}
        >
          <Text style={styles.recapShareBtn}>{t("common.share")}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recapText}>
        {t("rewards.yearInReview.summary", {
          days: unit(t, "day", recap.totalDays),
          shownUp: unit(t, "day", recap.daysShownUp),
          moments: unit(t, "barnabasMoment", recap.momentsDone),
          streak: unit(t, "day", recap.longestStreak),
        })}
      </Text>
      {recap.favoritesSaved > 0 ? (
        <Text style={[styles.recapText, { marginTop: 8 }]}>
          {t("rewards.yearInReview.favoritesSaved", { favorites: unit(t, "favorite", recap.favoritesSaved) })}
        </Text>
      ) : null}
    </View>
  );
}

export default function RewardsScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const { totalStars, streak, momentsDone, weeklyRecap, yearInReview, settings, updateSettings } = store;
  const [showYearShare, setShowYearShare] = useState(false);

  return (
    <View>
      <Text style={styles.title}>{t("rewards.title")}</Text>
      <Text style={styles.subtitle}>{t("rewards.subtitle")}</Text>

      <WeeklyRecapCard recap={weeklyRecap} styles={styles} />
      <YearInReviewCard recap={yearInReview} styles={styles} onShare={() => setShowYearShare(true)} />

      <View style={styles.summaryRow}>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{totalStars}</Text>
          <Text style={styles.tileLabel}>{t("rewards.totalStars")}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{streak}</Text>
          <Text style={styles.tileLabel}>{t("rewards.dayStreak")}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{momentsDone}</Text>
          <Text style={styles.tileLabel}>{t("rewards.barnabasMoments")}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("rewards.badgesTitle")}</Text>
      <View style={styles.badgesGrid}>
        {BADGE_DEFS.map((b) => {
          const value = b.type === "stars" ? totalStars : streak;
          const earned = value >= b.threshold;
          return (
            <View
              key={b.id}
              style={[styles.badge, !earned && styles.badgeLocked]}
              accessible
              accessibilityLabel={`${b.name}, ${b.desc}${earned ? "" : t("rewards.badgeLockedSuffix")}`}
            >
              <AppIcon
                set={b.icon.set}
                name={b.icon.name}
                solid={b.icon.solid}
                size={24}
                color={colors.goldText}
                style={styles.badgeIcon}
              />
              <Text style={styles.badgeName}>{b.name}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t("rewards.moodCalendarTitle")}</Text>
      <Text style={styles.subtitle}>{t("rewards.moodCalendarSubtitle")}</Text>
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
  const { t } = useTranslation();
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
          const dateLabel = entry ? formatDate(entry.dateLogged) : t("common.dayLabel", { day });
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
            {emoji} {t(`common.moods.${mood}`)}
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
    badgeIcon: { marginBottom: 6 },
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
