// Full Bible browser, reached from the ☰ menu — lets a reader pick any
// book and chapter directly, independent of any cited verse. Book list ->
// chapter grid -> opens the same BibleChapterModal used everywhere else
// (with its own version dropdown, so the download-on-first-use flow for
// the other 7 translations works here too). Chapter counts are read from
// the always-bundled KJV data purely to populate the picker — chapter
// divisions are standard across translations — so no download is needed
// until a chapter is actually opened.
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { BIBLE_BOOKS, chapterCount } from "../bibleLookup";
import { hapticTap } from "../haptics";
import BibleChapterModal from "../components/BibleChapterModal";

export default function BibleBrowserScreen({ onClose }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const [book, setBook] = useState(null);
  const [reading, setReading] = useState(null);

  const openBook = (name) => {
    hapticTap();
    setBook(name);
  };
  const openChapter = (chapterNum) => {
    hapticTap();
    setReading({ book, chapter: chapterNum });
  };

  const items = book ? Array.from({ length: chapterCount(book) }, (_, i) => i + 1) : BIBLE_BOOKS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{book || t("bibleBrowser.title")}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      {book ? (
        <TouchableOpacity onPress={() => setBook(null)} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backBtnText}>‹ {t("bibleBrowser.allBooks")}</Text>
        </TouchableOpacity>
      ) : null}
      <FlatList
        data={items}
        key={book ? "chapters" : "books"}
        keyExtractor={(item) => String(item)}
        numColumns={book ? 5 : 3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => (book ? openChapter(item) : openBook(item))}
            accessibilityRole="button"
          >
            <Text style={styles.gridItemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <BibleChapterModal
        visible={!!reading}
        book={reading?.book}
        chapter={reading?.chapter}
        highlightStart={null}
        highlightEnd={null}
        onClose={() => setReading(null)}
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
    backBtn: { marginBottom: 10 },
    backBtnText: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    grid: { paddingBottom: 40 },
    gridItem: {
      flex: 1,
      margin: 4,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    gridItemText: { fontSize: 13, fontWeight: "600", color: colors.text, textAlign: "center" },
  });
}
