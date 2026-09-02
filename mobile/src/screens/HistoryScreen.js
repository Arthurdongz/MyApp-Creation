import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

const MOOD_EMOJI = { joyful: "😊", peaceful: "🙂", hopeful: "🌱", tired: "😔", struggling: "😢" };

function formatDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function truncateForPreview(text) {
  const trimmed = text.trim();
  return trimmed.length > 72 ? `${trimmed.slice(0, 72).trimEnd()}…` : trimmed;
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

// Picks which of the three fields to show as an entry row's one-line
// preview and label, in the same priority order the old full-card view
// showed them in (reflection, then Barnabas moment, then kindness
// received) so nothing changes about what counts as "the" summary. The
// "type" is used purely to pick an icon so entries scan faster in the list.
function entryPreview(t, e) {
  if (e.reflection) return { type: "reflection", label: t("history.blockLabels.reflection"), text: e.reflection };
  if (e.barnabasNote) return { type: "moment", label: t("history.blockLabels.barnabasMoment"), text: e.barnabasNote };
  if (e.momentDone) return { type: "moment", label: t("history.blockLabels.barnabasMoment"), text: t("history.markedDone") };
  if (e.receivedKindness)
    return { type: "kindness", label: t("history.blockLabels.kindnessReceived"), text: e.receivedKindness };
  return null;
}

const ENTRY_TYPE_ICONS = { reflection: "create-outline", moment: "star", kindness: "gift-outline" };

export default function HistoryScreen({ store, onOpenReflection }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const entries = store.state.entries;
  const [query, setQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
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
  const todaysEntry = entries[`day-${store.latestDay}`];
  const todaysPreview = todaysEntry ? entryPreview(t, todaysEntry) : null;

  const openEntry = (dayNumber) => {
    hapticTap();
    onOpenReflection(dayNumber);
  };

  return (
    <View>
      <Text style={styles.title}>{t("history.title")}</Text>
      <Text style={styles.subtitle}>{t("history.subtitle")}</Text>

      <TouchableOpacity
        style={styles.writeTodayCard}
        onPress={() => openEntry(store.latestDay)}
        accessibilityRole="button"
        accessibilityLabel={t("history.writeToday.label")}
      >
        <View style={styles.writeTodayLeft}>
          <Ionicons name="create-outline" size={20} color={colors.sageDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.writeTodayTitle}>{t("history.writeToday.title")}</Text>
            <Text style={styles.writeTodaySub} numberOfLines={1}>
              {todaysPreview ? truncateForPreview(todaysPreview.text) : t("history.writeToday.emptyPrompt")}
            </Text>
          </View>
        </View>
        <Text style={styles.writeTodayArrow}>›</Text>
      </TouchableOpacity>

      {onThisDay ? (
        <View style={styles.onThisDayCard}>
          <Text style={styles.onThisDayLabel}>{t("history.onThisDayLabel")}</Text>
          <Text style={styles.onThisDayText}>{onThisDay}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.calendarToggle}
        onPress={() => {
          hapticTap();
          setShowCalendar((v) => !v);
        }}
        accessibilityRole="button"
        accessibilityLabel={showCalendar ? t("history.calendar.showList") : t("history.calendar.showCalendar")}
      >
        <Ionicons name={showCalendar ? "list-outline" : "calendar-outline"} size={15} color={colors.sageDark} />
        <Text style={styles.calendarToggleText}>
          {showCalendar ? t("history.calendar.showList") : t("history.calendar.showCalendar")}
        </Text>
      </TouchableOpacity>

      {showCalendar ? (
        <EntryCalendar store={store} styles={styles} onOpenDay={openEntry} />
      ) : (
        <>
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
            <View style={styles.list}>
              {keys.map((key, index) => {
                const e = entries[key];
                const preview = entryPreview(t, e);
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.entryRow, index === keys.length - 1 && styles.entryRowLast]}
                    onPress={() => openEntry(e.dayNumber)}
                    accessibilityRole="button"
                    accessibilityLabel={t("history.openEntryLabel", { day: e.dayNumber })}
                  >
                    <Text
                      style={styles.entryMood}
                      accessibilityLabel={
                        e.mood ? t("history.moodLabel", { mood: t(`common.moods.${e.mood}`) }) : undefined
                      }
                    >
                      {e.mood ? MOOD_EMOJI[e.mood] : "🕊️"}
                    </Text>
                    <View style={styles.entryRowBody}>
                      <View style={styles.entryRowTop}>
                        <Text style={styles.entryDate}>
                          {t("history.entryDate", { day: e.dayNumber, date: formatDate(e.dateLogged) })}
                        </Text>
                        {preview ? (
                          <View style={styles.entryTagRow}>
                            <Ionicons name={ENTRY_TYPE_ICONS[preview.type]} size={11} color={colors.textSoft} />
                            <Text style={styles.entryTag}>{preview.label}</Text>
                          </View>
                        ) : null}
                      </View>
                      {preview ? (
                        <Text style={styles.entryPreview} numberOfLines={1}>
                          {truncateForPreview(preview.text)}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.entryChevron}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}
    </View>
  );
}

// A tap-to-revisit grid alternative to the list above, for quickly finding
// a specific day rather than scrolling or searching by text — every day so
// far, color-coded by what's logged on it. Mirrors the visual pattern of
// RewardsScreen's JourneyCalendar, but every day (with or without an entry)
// opens straight into that day's entry editor, matching what tapping a row
// in the list above already does.
function EntryCalendar({ store, styles, onOpenDay }) {
  const { t } = useTranslation();
  const entries = store.state.entries;
  const latest = store.latestDay;
  const days = [];
  for (let day = 1; day <= latest; day++) days.push(day);

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={styles.calGrid}>
        {days.map((day) => {
          const entry = entries[`day-${day}`];
          const hasContent = !!(
            entry &&
            (entry.reflection || entry.barnabasNote || entry.receivedKindness || entry.momentDone)
          );
          const dateLabel = entry ? formatDate(entry.dateLogged) : t("common.dayLabel", { day });
          return (
            <TouchableOpacity
              key={day}
              style={[styles.calCell, hasContent && styles.calCellLogged, entry?.momentDone && styles.calCellMoment]}
              onPress={() => onOpenDay(day)}
              accessibilityRole="button"
              accessibilityLabel={t("history.calendar.dayLabel", { day, date: dateLabel })}
            />
          );
        })}
      </View>
      <View style={styles.calLegendRow}>
        <View style={styles.calLegendItem}>
          <View style={[styles.calLegendDot, styles.calCellMoment]} />
          <Text style={styles.calLegendText}>{t("history.calendar.legendMoment")}</Text>
        </View>
        <View style={styles.calLegendItem}>
          <View style={[styles.calLegendDot, styles.calCellLogged]} />
          <Text style={styles.calLegendText}>{t("history.calendar.legendEntry")}</Text>
        </View>
        <View style={styles.calLegendItem}>
          <View style={styles.calLegendDot} />
          <Text style={styles.calLegendText}>{t("history.calendar.legendEmpty")}</Text>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 18 },
    empty: { fontSize: 14, color: colors.textSoft, textAlign: "center", paddingVertical: 30 },
    writeTodayCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      backgroundColor: colors.buttonBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
      ...shadow,
    },
    writeTodayLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    writeTodayTitle: { fontSize: 14.5, fontWeight: "700", color: colors.buttonOnText },
    writeTodaySub: { fontSize: 12, color: colors.buttonOnText, opacity: 0.85, marginTop: 2 },
    writeTodayArrow: { fontSize: 20, fontWeight: "700", color: colors.buttonOnText },
    calendarToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    calendarToggleText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    calGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 12 },
    calCell: {
      width: 12,
      height: 12,
      borderRadius: 3,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    calCellLogged: { backgroundColor: colors.sage, borderColor: colors.sage },
    calCellMoment: { backgroundColor: colors.gold, borderColor: colors.gold },
    calLegendRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 24 },
    calLegendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    calLegendDot: { width: 12, height: 12, borderRadius: 3 },
    calLegendText: { fontSize: 12, color: colors.textSoft },
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
    list: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      ...shadow,
    },
    entryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    entryRowLast: { borderBottomWidth: 0 },
    entryMood: { fontSize: 17, width: 22, textAlign: "center" },
    entryRowBody: { flex: 1, minWidth: 0 },
    entryRowTop: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
    entryDate: { fontWeight: "700", fontSize: 12.5, color: colors.sageDark },
    entryTagRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    entryTag: {
      fontSize: 9.5,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: colors.textSoft,
      fontWeight: "700",
    },
    entryPreview: { fontSize: 12.5, color: colors.textSoft, marginTop: 2 },
    entryChevron: { fontSize: 18, color: colors.textSoft },
  });
}
