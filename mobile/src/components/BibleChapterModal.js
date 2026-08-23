import { useEffect, useRef, useState } from "react";
import { Clipboard, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { getChapter, chapterCount } from "../bibleLookup";
import { hapticTap } from "../haptics";
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_OVERLAY_COLORS,
  HIGHLIGHT_SWATCH_COLORS,
  clearVersesMarks,
  getVerseMark,
  loadBibleHighlights,
  setVersesColor,
  setVersesNote,
  setVersesUnderline,
} from "../bibleHighlights";

const HIGHLIGHT_LABEL_KEYS = {
  green: "today.confession.highlightGreen",
  yellow: "today.confession.highlightYellow",
  red: "today.confession.highlightRed",
  blue: "today.confession.highlightBlue",
};

// Groups a sorted list of verse numbers into range strings — [3,4,5,8] ->
// "3-5,8" — matching the same comma/range convention already used for
// scripture refs elsewhere in the app (e.g. "Psalm 13:1,5").
function formatVerseRanges(sortedNums) {
  const parts = [];
  let start = sortedNums[0];
  let prev = sortedNums[0];
  for (let i = 1; i <= sortedNums.length; i++) {
    const n = sortedNums[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = n;
    prev = n;
  }
  return parts.join(",");
}

// Full-chapter reader, reached from VersePopup's "Read the full chapter"
// link — a contained popup card (same footprint as VersePopup, not a
// full-screen page) so it reads as "still on this screen" rather than
// navigating away; the chapter itself scrolls inside the card, opening
// scrolled to the cited verse rather than the top. The cited verse(s) stay
// highlighted, and Prev/Next lets the reader keep going through the book
// from there.
//
// Tapping a verse toggles it into a selection (more than one verse can be
// selected at once) and reveals a small marker icon; tapping that icon
// expands the full action row — 4 highlight colors, a "clear" swatch, an
// underline toggle, a note editor, and copy-to-clipboard. Picking a color,
// clearing, or underlining applies to every selected verse at once and
// then closes everything back down (so a mis-tap is one more tap away from
// gone); the note editor and copy stay a step slower on purpose since
// they're not one-tap actions. Marks persist locally across chapters and
// sessions.
export default function BibleChapterModal({ visible, book, chapter, highlightStart, highlightEnd, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [copiedFlash, setCopiedFlash] = useState(false);
  const [marks, setMarks] = useState({});
  const scrollRef = useRef(null);
  const scrolledToTargetRef = useRef(false);
  const copyFlashTimerRef = useRef(null);

  useEffect(() => {
    loadBibleHighlights().then(setMarks);
  }, []);

  useEffect(() => () => clearTimeout(copyFlashTimerRef.current), []);

  const closeSelection = () => {
    setSelectedVerses([]);
    setMenuOpen(false);
    setNoteEditorOpen(false);
    setCopiedFlash(false);
    clearTimeout(copyFlashTimerRef.current);
  };

  useEffect(() => {
    if (visible) {
      setCurrentChapter(chapter);
      closeSelection();
      scrolledToTargetRef.current = false;
      if (highlightStart == null) {
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, chapter, book, highlightStart]);

  if (!book) return null;

  const verses = getChapter(book, currentChapter);
  const total = chapterCount(book);
  const isCitedVerse = (v) => currentChapter === chapter && highlightStart != null && v >= highlightStart && v <= highlightEnd;

  const goPrev = () => {
    if (currentChapter <= 1) return;
    hapticTap();
    closeSelection();
    setCurrentChapter((c) => c - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const goNext = () => {
    if (currentChapter >= total) return;
    hapticTap();
    closeSelection();
    setCurrentChapter((c) => c + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const onVersePress = (verseNum) => {
    hapticTap();
    setSelectedVerses((prev) => {
      const next = prev.includes(verseNum) ? prev.filter((v) => v !== verseNum) : [...prev, verseNum].sort((a, b) => a - b);
      if (next.length === 0) {
        setMenuOpen(false);
        setNoteEditorOpen(false);
      }
      return next;
    });
  };

  const selectedMarks = selectedVerses.map((v) => getVerseMark(marks, book, currentChapter, v));
  const commonColor =
    selectedVerses.length > 0 && selectedMarks.every((m) => m?.color === selectedMarks[0]?.color) ? selectedMarks[0]?.color : null;
  const allUnderlined = selectedVerses.length > 0 && selectedMarks.every((m) => m?.underline);

  const applyColor = (color) => {
    hapticTap();
    setMarks((prev) => setVersesColor(prev, book, currentChapter, selectedVerses, color));
    closeSelection();
  };
  const applyClear = () => {
    hapticTap();
    setMarks((prev) => clearVersesMarks(prev, book, currentChapter, selectedVerses));
    closeSelection();
  };
  const applyUnderline = () => {
    hapticTap();
    setMarks((prev) => setVersesUnderline(prev, book, currentChapter, selectedVerses, !allUnderlined));
    closeSelection();
  };
  const openNoteEditor = () => {
    hapticTap();
    const notes = selectedMarks.map((m) => m?.note || "");
    setNoteDraft(notes.every((n) => n === notes[0]) ? notes[0] : "");
    setNoteEditorOpen(true);
  };
  const saveNote = () => {
    hapticTap();
    setMarks((prev) => setVersesNote(prev, book, currentChapter, selectedVerses, noteDraft));
    closeSelection();
  };
  const handleCopy = () => {
    hapticTap();
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const text = sorted.map((vNum) => verses?.find((v) => v.verse === vNum)?.text).filter(Boolean).join(" ");
    const ref = `${book} ${currentChapter}:${formatVerseRanges(sorted)}`;
    try {
      Clipboard.setString(`“${text}” — ${ref}`);
    } catch (e) {
      // clipboard unavailable — nothing to fall back to here
    }
    setCopiedFlash(true);
    clearTimeout(copyFlashTimerRef.current);
    copyFlashTimerRef.current = setTimeout(closeSelection, 900);
  };

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

          {selectedVerses.length > 0 ? (
            <View style={styles.markToolbar}>
              {noteEditorOpen ? (
                <View style={styles.noteEditor}>
                  <TextInput
                    style={styles.noteInput}
                    value={noteDraft}
                    onChangeText={setNoteDraft}
                    placeholder={t("today.confession.notePlaceholder")}
                    placeholderTextColor={colors.textSoft}
                    multiline
                    autoFocus
                  />
                  <View style={styles.noteEditorActions}>
                    <TouchableOpacity onPress={() => setNoteEditorOpen(false)} style={styles.noteCancelBtn}>
                      <Text style={styles.noteCancelText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveNote} style={styles.noteSaveBtn}>
                      <Text style={styles.noteSaveText}>{t("today.confession.saveNote")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : menuOpen ? (
                <View style={styles.markToolbarRow}>
                  <Text style={styles.markToolbarLabel}>
                    {copiedFlash ? t("today.confession.copied") : t("today.confession.selectedCount", { count: selectedVerses.length })}
                  </Text>
                  <View style={styles.markToolbarActions}>
                    {HIGHLIGHT_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => applyColor(color)}
                        accessibilityRole="button"
                        accessibilityLabel={t(HIGHLIGHT_LABEL_KEYS[color])}
                        accessibilityState={{ selected: commonColor === color }}
                        style={[styles.swatch, { backgroundColor: HIGHLIGHT_SWATCH_COLORS[color] }, commonColor === color && styles.swatchActive]}
                      />
                    ))}
                    <TouchableOpacity
                      onPress={applyClear}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.confession.clearMark")}
                      style={styles.clearSwatch}
                    >
                      <Text style={styles.clearSwatchText}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={applyUnderline}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.confession.underline")}
                      accessibilityState={{ selected: allUnderlined }}
                      style={[styles.underlineBtn, allUnderlined && styles.underlineBtnActive]}
                    >
                      <Text style={[styles.underlineBtnText, allUnderlined && styles.underlineBtnTextActive]}>U</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openNoteEditor} accessibilityRole="button" accessibilityLabel={t("today.confession.addNote")} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCopy} accessibilityRole="button" accessibilityLabel={t("today.confession.copyVerse")} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>📋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setMenuOpen(true)}
                  style={styles.markIconRow}
                  accessibilityRole="button"
                  accessibilityLabel={t("today.confession.showMarkOptions")}
                >
                  <Text style={styles.markToolbarLabel}>{t("today.confession.selectedCount", { count: selectedVerses.length })}</Text>
                  <Text style={styles.markIcon}>🖍️</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          <ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent}>
            {verses ? (
              verses.map((v) => {
                const mark = getVerseMark(marks, book, currentChapter, v.verse);
                const cited = isCitedVerse(v.verse);
                const selected = selectedVerses.includes(v.verse);
                return (
                  <TouchableOpacity
                    key={v.verse}
                    activeOpacity={0.7}
                    onPress={() => onVersePress(v.verse)}
                    onLayout={(e) => {
                      if (!scrolledToTargetRef.current && cited && v.verse === highlightStart) {
                        scrolledToTargetRef.current = true;
                        const y = e.nativeEvent.layout.y;
                        scrollRef.current?.scrollTo({ y: Math.max(0, y - 40), animated: false });
                      }
                    }}
                    style={[
                      styles.verseRow,
                      cited && !mark?.color && styles.verseRowCited,
                      mark?.color && { backgroundColor: HIGHLIGHT_OVERLAY_COLORS[mark.color] },
                      selected && styles.verseRowSelected,
                    ]}
                  >
                    <Text style={[styles.verseLine, mark?.underline && styles.verseLineUnderlined]}>
                      <Text style={styles.verseNum}>{v.verse} </Text>
                      {v.text}
                      {mark?.note ? <Text style={styles.noteIndicator}> 📝</Text> : null}
                    </Text>
                  </TouchableOpacity>
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
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.verseCard,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    markIconRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    markIcon: { fontSize: 20 },
    markToolbarRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
    markToolbarLabel: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    markToolbarActions: { flexDirection: "row", alignItems: "center", gap: 8 },
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
    clearSwatch: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    clearSwatchText: { fontSize: 12, fontWeight: "700", color: colors.textSoft },
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
    iconBtn: {
      width: 26,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtnText: { fontSize: 15 },
    noteEditor: { gap: 8 },
    noteInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      minHeight: 60,
      fontSize: 14,
      color: colors.text,
      textAlignVertical: "top",
    },
    noteEditorActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
    noteCancelBtn: { paddingVertical: 6, paddingHorizontal: 10 },
    noteCancelText: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
    noteSaveBtn: { paddingVertical: 6, paddingHorizontal: 10 },
    noteSaveText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    body: {},
    bodyContent: { padding: 20 },
    verseRow: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginHorizontal: -8, marginBottom: 4 },
    verseRowCited: { backgroundColor: colors.verseCard },
    verseRowSelected: { borderWidth: 1, borderColor: colors.sageDark },
    verseLine: { fontSize: 16, lineHeight: 26, color: colors.text },
    verseLineUnderlined: { textDecorationLine: "underline" },
    verseNum: { fontSize: 12, fontWeight: "700", color: colors.sage },
    noteIndicator: { fontSize: 12 },
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
