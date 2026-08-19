import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { getChapter, chapterCount } from "../bibleLookup";
import { hapticTap } from "../haptics";

// Full-chapter reader, reached from VersePopup's "Read the full chapter"
// link — turns a single confession reference into a small devotional
// reading session: the cited verse(s) stay highlighted, and Prev/Next lets
// the reader keep going through the book from there.
export default function BibleChapterModal({ visible, book, chapter, highlightStart, highlightEnd, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setCurrentChapter(chapter);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [visible, chapter, book]);

  if (!book) return null;

  const verses = getChapter(book, currentChapter);
  const total = chapterCount(book);
  const isHighlighted = (v) => currentChapter === chapter && highlightStart != null && v >= highlightStart && v <= highlightEnd;

  const goPrev = () => {
    if (currentChapter <= 1) return;
    hapticTap();
    setCurrentChapter((c) => c - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const goNext = () => {
    if (currentChapter >= total) return;
    hapticTap();
    setCurrentChapter((c) => c + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {book} {currentChapter}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent}>
          {verses ? (
            verses.map((v) => (
              <Text key={v.verse} style={[styles.verseLine, isHighlighted(v.verse) && styles.verseLineHighlighted]}>
                <Text style={styles.verseNum}>{v.verse} </Text>
                {v.text}
              </Text>
            ))
          ) : (
            <Text style={styles.verseLine}>{t("today.confession.verseUnavailable")}</Text>
          )}
        </ScrollView>

        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={goPrev}
            disabled={currentChapter <= 1}
            style={[styles.navBtn, currentChapter <= 1 && styles.navBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={t("today.confession.prevChapter")}
          >
            <Text style={[styles.navBtnText, currentChapter <= 1 && styles.navBtnTextDisabled]}>‹ {t("today.confession.prevChapter")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNext}
            disabled={currentChapter >= total}
            style={[styles.navBtn, currentChapter >= total && styles.navBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={t("today.confession.nextChapter")}
          >
            <Text style={[styles.navBtnText, currentChapter >= total && styles.navBtnTextDisabled]}>{t("today.confession.nextChapter")} ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingTop: 54,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 19, fontWeight: "700", color: colors.sageDark },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 13, color: colors.textSoft },
    body: { flex: 1 },
    bodyContent: { padding: 20, paddingBottom: 32 },
    verseLine: { fontSize: 16, lineHeight: 26, color: colors.text, marginBottom: 8 },
    verseLineHighlighted: {
      backgroundColor: colors.verseCard,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginHorizontal: -8,
    },
    verseNum: { fontSize: 12, fontWeight: "700", color: colors.sage },
    navRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...shadow,
    },
    navBtn: { paddingVertical: 10, paddingHorizontal: 16 },
    navBtnDisabled: { opacity: 0.35 },
    navBtnText: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    navBtnTextDisabled: { color: colors.textSoft },
  });
}
