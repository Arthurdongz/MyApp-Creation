// Browses every verse the reader has marked in the Bible — highlights,
// bookmarks, and notes — in one place, since BibleChapterModal only ever
// shows marks one chapter at a time. Three filterable tabs over the same
// flat list from getAllMarkedVerses(); tapping a row jumps straight into
// BibleChapterModal at that verse, same as VersePopup does for a cited ref.
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { getChapter } from "../bibleLookup";
import { hapticTap } from "../haptics";
import { HIGHLIGHT_SWATCH_COLORS, getAllMarkedVerses, loadBibleHighlights } from "../bibleHighlights";
import BibleChapterModal from "../components/BibleChapterModal";

const TABS = [
  { key: "highlights", i18nKey: "bibleMarks.tabHighlights", match: (m) => !!m.color },
  { key: "bookmarks", i18nKey: "bibleMarks.tabBookmarks", match: (m) => !!m.bookmark },
  { key: "notes", i18nKey: "bibleMarks.tabNotes", match: (m) => !!m.note },
];

export default function BibleMarksScreen({ onClose }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const [tab, setTab] = useState("highlights");
  const [marks, setMarks] = useState([]);
  const [reading, setReading] = useState(null);

  useEffect(() => {
    loadBibleHighlights().then((map) => setMarks(getAllMarkedVerses(map)));
  }, []);

  // Reload whenever the chapter modal closes, in case a mark changed
  // (color/bookmark/note edited or cleared) while it was open.
  const closeReader = () => {
    setReading(null);
    loadBibleHighlights().then((map) => setMarks(getAllMarkedVerses(map)));
  };

  const openEntry = (entry) => {
    hapticTap();
    setReading({ book: entry.book, chapter: entry.chapter, verse: entry.verse });
  };

  const activeTab = TABS.find((tb) => tb.key === tab);
  const items = marks.filter(activeTab.match);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("bibleMarks.title")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tb) => (
          <TouchableOpacity
            key={tb.key}
            style={[styles.tabBtn, tab === tb.key && styles.tabBtnActive]}
            onPress={() => {
              hapticTap();
              setTab(tb.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === tb.key }}
          >
            <Text style={[styles.tabLabel, tab === tb.key && styles.tabLabelActive]}>{t(tb.i18nKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyState}>{t(`bibleMarks.empty_${tab}`)}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.book}|${item.chapter}|${item.verse}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const verseText = getChapter(item.book, item.chapter)?.find((v) => v.verse === item.verse)?.text || "";
            return (
              <TouchableOpacity style={styles.row} onPress={() => openEntry(item)} accessibilityRole="button">
                <View style={styles.rowTop}>
                  <Text style={styles.rowRef}>
                    {item.book} {item.chapter}:{item.verse}
                  </Text>
                  <View style={styles.rowBadges}>
                    {item.color ? <View style={[styles.colorDot, { backgroundColor: HIGHLIGHT_SWATCH_COLORS[item.color] }]} /> : null}
                    {item.bookmark ? <Text style={styles.badgeIcon}>🔖</Text> : null}
                    {item.note ? <Text style={styles.badgeIcon}>📝</Text> : null}
                  </View>
                </View>
                <Text style={styles.rowText} numberOfLines={2}>
                  {tab === "notes" ? item.note : verseText}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <BibleChapterModal
        visible={!!reading}
        book={reading?.book}
        chapter={reading?.chapter}
        highlightStart={reading?.verse}
        highlightEnd={reading?.verse}
        onClose={closeReader}
      />
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 18 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: "700", color: colors.sageDark, flex: 1, marginRight: 12 },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, color: colors.textSoft },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 14 },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.sageDark, borderColor: colors.sageDark },
    tabLabel: { fontSize: 13, fontWeight: "700", color: colors.text },
    tabLabelActive: { color: "#fff" },
    emptyState: { fontSize: 14, color: colors.textSoft, fontStyle: "italic", marginTop: 8 },
    list: { paddingBottom: 40 },
    row: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    rowRef: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    rowBadges: { flexDirection: "row", alignItems: "center", gap: 6 },
    colorDot: { width: 12, height: 12, borderRadius: 6 },
    badgeIcon: { fontSize: 13 },
    rowText: { fontSize: 14, lineHeight: 20, color: colors.text },
  });
}
