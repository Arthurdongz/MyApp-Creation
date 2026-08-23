import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { getChapter, chapterCount } from "../bibleLookup";
import { hapticTap } from "../haptics";
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_OVERLAY_COLORS,
  HIGHLIGHT_SWATCH_COLORS,
  getVerseMark,
  loadBibleHighlights,
  setVerseHighlightColor,
  toggleVerseUnderline,
} from "../bibleHighlights";

const HIGHLIGHT_LABEL_KEYS = {
  green: "today.confession.highlightGreen",
  yellow: "today.confession.highlightYellow",
  red: "today.confession.highlightRed",
  blue: "today.confession.highlightBlue",
};

// Full-chapter reader, reached from VersePopup's "Read the full chapter"
// link — a contained popup card (same footprint as VersePopup, not a
// full-screen page) so it reads as "still on this screen" rather than
// navigating away; the chapter itself scrolls inside the card, opening
// scrolled to the cited verse rather than the top. The cited verse(s) stay
// highlighted, and Prev/Next lets the reader keep going through the book
// from there. Tapping any verse selects it and reveals a small mark-up
// toolbar (4 highlight colors + underline) for personal study — marks
// persist locally across chapters and sessions.
export default function BibleChapterModal({ visible, book, chapter, highlightStart, highlightEnd, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [marks, setMarks] = useState({});
  const scrollRef = useRef(null);
  const scrolledToTargetRef = useRef(false);

  useEffect(() => {
    loadBibleHighlights().then(setMarks);
  }, []);

  useEffect(() => {
    if (visible) {
      setCurrentChapter(chapter);
      setSelectedVerse(null);
      scrolledToTargetRef.current = false;
      if (highlightStart == null) {
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
      }
    }
  }, [visible, chapter, book, highlightStart]);

  if (!book) return null;

  const verses = getChapter(book, currentChapter);
  const total = chapterCount(book);
  const isCitedVerse = (v) => currentChapter === chapter && highlightStart != null && v >= highlightStart && v <= highlightEnd;

  const goPrev = () => {
    if (currentChapter <= 1) return;
    hapticTap();
    setSelectedVerse(null);
    setCurrentChapter((c) => c - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const goNext = () => {
    if (currentChapter >= total) return;
    hapticTap();
    setSelectedVerse(null);
    setCurrentChapter((c) => c + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const onVersePress = (verseNum) => {
    hapticTap();
    setSelectedVerse((v) => (v === verseNum ? null : verseNum));
  };

  const applyColor = (color) => {
    if (selectedVerse == null) return;
    hapticTap();
    setMarks((prev) => setVerseHighlightColor(prev, book, currentChapter, selectedVerse, color));
  };

  const applyUnderline = () => {
    if (selectedVerse == null) return;
    hapticTap();
    setMarks((prev) => toggleVerseUnderline(prev, book, currentChapter, selectedVerse));
  };

  const selectedMark = selectedVerse != null ? getVerseMark(marks, book, currentChapter, selectedVerse) : null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {book} {currentChapter}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedVerse != null ? (
            <View style={styles.markToolbar}>
              <Text style={styles.markToolbarLabel}>{t("today.confession.verseSelected", { n: selectedVerse })}</Text>
              <View style={styles.markToolbarActions}>
                {HIGHLIGHT_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => applyColor(color)}
                    accessibilityRole="button"
                    accessibilityLabel={t(HIGHLIGHT_LABEL_KEYS[color])}
                    accessibilityState={{ selected: selectedMark?.color === color }}
                    style={[
                      styles.swatch,
                      { backgroundColor: HIGHLIGHT_SWATCH_COLORS[color] },
                      selectedMark?.color === color && styles.swatchActive,
                    ]}
                  />
                ))}
                <TouchableOpacity
                  onPress={applyUnderline}
                  accessibilityRole="button"
                  accessibilityLabel={t("today.confession.underline")}
                  accessibilityState={{ selected: !!selectedMark?.underline }}
                  style={[styles.underlineBtn, selectedMark?.underline && styles.underlineBtnActive]}
                >
                  <Text style={[styles.underlineBtnText, selectedMark?.underline && styles.underlineBtnTextActive]}>U</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent}>
            {verses ? (
              verses.map((v) => {
                const mark = getVerseMark(marks, book, currentChapter, v.verse);
                const cited = isCitedVerse(v.verse);
                return (
                  <Text
                    key={v.verse}
                    onPress={() => onVersePress(v.verse)}
                    onLayout={(e) => {
                      if (!scrolledToTargetRef.current && cited && v.verse === highlightStart) {
                        scrolledToTargetRef.current = true;
                        const y = e.nativeEvent.layout.y;
                        scrollRef.current?.scrollTo({ y: Math.max(0, y - 40), animated: false });
                      }
                    }}
                    style={[
                      styles.verseLine,
                      cited && !mark?.color && styles.verseLineCited,
                      mark?.color && { backgroundColor: HIGHLIGHT_OVERLAY_COLORS[mark.color], borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: -8 },
                      mark?.underline && styles.verseLineUnderlined,
                      selectedVerse === v.verse && styles.verseLineSelected,
                    ]}
                  >
                    <Text style={styles.verseNum}>{v.verse} </Text>
                    {v.text}
                  </Text>
                );
              })
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
      </View>
    </Modal>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(20, 24, 18, 0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      width: "100%",
      maxWidth: 420,
      maxHeight: "80%",
      overflow: "hidden",
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.sageDark },
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
    markToolbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.verseCard,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    markToolbarLabel: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    markToolbarActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    swatch: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: "transparent",
    },
    swatchActive: {
      borderColor: colors.sageDark,
    },
    underlineBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },
    underlineBtnActive: {
      backgroundColor: colors.sageDark,
      borderColor: colors.sageDark,
    },
    underlineBtnText: { fontSize: 13, fontWeight: "700", color: colors.text, textDecorationLine: "underline" },
    underlineBtnTextActive: { color: "#fff" },
    body: {},
    bodyContent: { padding: 20 },
    verseLine: { fontSize: 16, lineHeight: 26, color: colors.text, marginBottom: 8 },
    verseLineCited: {
      backgroundColor: colors.verseCard,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginHorizontal: -8,
    },
    verseLineUnderlined: { textDecorationLine: "underline" },
    verseLineSelected: {
      borderWidth: 1,
      borderColor: colors.sageDark,
      borderRadius: 8,
      marginHorizontal: -1,
    },
    verseNum: { fontSize: 12, fontWeight: "700", color: colors.sage },
    navRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    navBtn: { paddingVertical: 10, paddingHorizontal: 16 },
    navBtnDisabled: { opacity: 0.35 },
    navBtnText: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    navBtnTextDisabled: { color: colors.textSoft },
  });
}
