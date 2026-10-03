import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

// A tap-to-revisit grid of one cell per journey day, shared by History's
// EntryCalendar and Rewards' JourneyCalendar — both rendered the exact same
// 12px dot grid (card/sage/gold cell states) plus a 3-item legend, differing
// only in which entry fields counted as "logged" and what the legend text
// and tap handler were. Callers own the day range, the "does this day count"
// predicate, and any per-screen header (Rewards' progress bar) themselves;
// this component only ever renders the grid + legend.
export default function DayGridCalendar({ latest, entries, hasContent, onSelectDay, dayLabel, legendMomentText, legendLoggedText, legendEmptyText }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const days = [];
  for (let day = 1; day <= latest; day++) days.push(day);

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={styles.grid}>
        {days.map((day) => {
          const entry = entries[`day-${day}`];
          const logged = !!(entry && hasContent(entry));
          return (
            <TouchableOpacity
              key={day}
              style={[styles.cell, logged && styles.cellLogged, entry?.momentDone && styles.cellMoment]}
              onPress={() => onSelectDay(day)}
              accessibilityRole="button"
              accessibilityLabel={dayLabel(day, entry)}
            />
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.cellMoment]} />
          <Text style={styles.legendText}>{legendMomentText}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.cellLogged]} />
          <Text style={styles.legendText}>{legendLoggedText}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>{legendEmptyText}</Text>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 12 },
    cell: {
      width: 12,
      height: 12,
      borderRadius: 3,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cellLogged: { backgroundColor: colors.sage, borderColor: colors.sage },
    cellMoment: { backgroundColor: colors.gold, borderColor: colors.gold },
    legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 24 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 3 },
    legendText: { fontSize: 12, color: colors.textSoft },
  });
}
