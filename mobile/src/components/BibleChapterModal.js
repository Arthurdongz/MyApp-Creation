import { useEffect, useRef, useState } from "react";
import { Clipboard, Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { getChapterFrom, chapterCountFrom } from "../bibleLookup";
import KJV_TEXT from "../data/bible-kjv.json";
import { BIBLE_VERSIONS } from "../data/verses";
import { getCachedVersionText, isVersionLoaded, loadVersionText } from "../bibleVersions";
import { hapticTap } from "../haptics";
import {
  HIGHLIGHT_COLORS,
  HIGHLIGHT_OVERLAY_COLORS,
  HIGHLIGHT_SWATCH_COLORS,
  clearVersesMarks,
  getVerseMark,
  loadBibleHighlights,
  setVersesBookmark,
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
// selected at once, by tapping further verses while the bar is open) and
// immediately opens the action bar at the bottom of the reader: copy,
// share, note, bookmark, and a highlight star. The star expands into the
// 4 color swatches, a "clear" swatch, and an underline toggle; picking a
// color, clearing, underlining, or bookmarking applies to every selected
// verse at once and closes everything back down (so a mis-tap is one more
// tap away from gone). The note editor and copy/share stay a step slower
// on purpose since they're not one-tap actions. Marks persist locally
// across chapters and sessions.
// Remembers the last version the reader was showing, so reopening it (or
// jumping into a different cited verse) keeps the reader's own choice
// instead of resetting to KJV every time.
let lastUsedBibleVersion = "KJV";

export default function BibleChapterModal({ visible, book, chapter, highlightStart, highlightEnd, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [actionBarOpen, setActionBarOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [copiedFlash, setCopiedFlash] = useState(false);
  const [marks, setMarks] = useState({});
  const [version, setVersion] = useState(lastUsedBibleVersion);
  const [versionPickerOpen, setVersionPickerOpen] = useState(false);
  const [versionData, setVersionData] = useState(() => getCachedVersionText(lastUsedBibleVersion));
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionError, setVersionError] = useState(false);
  const scrollRef = useRef(null);
  const scrolledToTargetRef = useRef(false);
  const copyFlashTimerRef = useRef(null);
  const versionRequestRef = useRef(0);

  useEffect(() => {
    loadBibleHighlights().then(setMarks);
  }, []);

  useEffect(() => () => clearTimeout(copyFlashTimerRef.current), []);

  const closeSelection = () => {
    setSelectedVerses([]);
    setActionBarOpen(false);
    setColorPickerOpen(false);
    setNoteEditorOpen(false);
    setCopiedFlash(false);
    clearTimeout(copyFlashTimerRef.current);
  };

  const loadVersion = (id) => {
    const requestId = ++versionRequestRef.current;
    const cached = getCachedVersionText(id);
    setVersionData(cached);
    setVersionError(false);
    setVersionLoading(!cached);
    if (cached) return;
    loadVersionText(id)
      .then((data) => {
        if (versionRequestRef.current !== requestId) return;
        setVersionData(data);
        setVersionLoading(false);
      })
      .catch(() => {
        if (versionRequestRef.current !== requestId) return;
        setVersionLoading(false);
        setVersionError(true);
      });
  };

  useEffect(() => {
    if (visible) {
      setCurrentChapter(chapter);
      closeSelection();
      setVersionPickerOpen(false);
      scrolledToTargetRef.current = false;
      setVersion(lastUsedBibleVersion);
      loadVersion(lastUsedBibleVersion);
      if (highlightStart == null) {
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, chapter, book, highlightStart]);

  if (!book) return null;

  const selectVersion = (id) => {
    setVersionPickerOpen(false);
    if (id === version) return;
    hapticTap();
    lastUsedBibleVersion = id;
    setVersion(id);
    closeSelection();
    loadVersion(id);
  };

  const verses = versionData ? getChapterFrom(versionData, book, currentChapter) : null;
  const kjvVerses = getChapterFrom(KJV_TEXT, book, currentChapter);
  const total = versionData ? chapterCountFrom(versionData, book) : 0;
  const isCitedVerse = (v) => currentChapter === chapter && highlightStart != null && v >= highlightStart && v <= highlightEnd;

  const goPrev = () => {
    if (versionLoading || currentChapter <= 1) return;
    hapticTap();
    closeSelection();
    setCurrentChapter((c) => c - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const goNext = () => {
    if (versionLoading || currentChapter >= total) return;
    hapticTap();
    closeSelection();
    setCurrentChapter((c) => c + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Tapping a verse toggles it into the selection (more than one verse can
  // be selected at once) and immediately opens the full bottom action bar
  // — every icon at once, no long-press needed.
  const onVersePress = (verseNum) => {
    hapticTap();
    setSelectedVerses((prev) => {
      const next = prev.includes(verseNum) ? prev.filter((v) => v !== verseNum) : [...prev, verseNum].sort((a, b) => a - b);
      if (next.length === 0) {
        closeSelection();
      } else {
        setColorPickerOpen(false);
        setNoteEditorOpen(false);
        setActionBarOpen(true);
      }
      return next;
    });
  };

  const selectedMarks = selectedVerses.map((v) => getVerseMark(marks, book, currentChapter, v));
  const commonColor =
    selectedVerses.length > 0 && selectedMarks.every((m) => m?.color === selectedMarks[0]?.color) ? selectedMarks[0]?.color : null;
  const allUnderlined = selectedVerses.length > 0 && selectedMarks.every((m) => m?.underline);
  const allBookmarked = selectedVerses.length > 0 && selectedMarks.every((m) => m?.bookmark);

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
  const applyBookmark = () => {
    hapticTap();
    setMarks((prev) => setVersesBookmark(prev, book, currentChapter, selectedVerses, !allBookmarked));
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
  const selectionText = () => {
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const text = sorted.map((vNum) => verses?.find((v) => v.verse === vNum)?.text).filter(Boolean).join(" ");
    const ref = `${book} ${currentChapter}:${formatVerseRanges(sorted)}`;
    return `“${text}” — ${ref}`;
  };
  const handleCopy = () => {
    hapticTap();
    try {
      Clipboard.setString(selectionText());
    } catch (e) {
      // clipboard unavailable — nothing to fall back to here
    }
    setCopiedFlash(true);
    clearTimeout(copyFlashTimerRef.current);
    copyFlashTimerRef.current = setTimeout(closeSelection, 900);
  };
  const handleShare = () => {
    hapticTap();
    Share.share({ message: selectionText() }).catch(() => {});
    closeSelection();
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

          <View style={styles.versionRow}>
            <Text style={styles.versionRowLabel}>{t("today.confession.bibleVersion")}</Text>
            <TouchableOpacity
              onPress={() => setVersionPickerOpen((o) => !o)}
              style={styles.versionBtn}
              accessibilityRole="button"
              accessibilityLabel={t("today.confession.chooseVersion")}
            >
              <Text style={styles.versionBtnText}>{version} ▾</Text>
            </TouchableOpacity>
          </View>
          {versionPickerOpen ? (
            <View style={styles.versionDropdown}>
              <ScrollView>
                {BIBLE_VERSIONS.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => selectVersion(v.id)}
                    style={styles.versionDropdownItem}
                    accessibilityRole="button"
                    accessibilityState={{ selected: v.id === version }}
                  >
                    <Text style={[styles.versionDropdownText, v.id === version && styles.versionDropdownTextActive]}>
                      {v.name} ({v.id})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
          {versionLoading ? (
            <Text style={styles.versionStatus}>
              {t("today.confession.downloadingVersion", { version: BIBLE_VERSIONS.find((v) => v.id === version)?.name || version })}
            </Text>
          ) : versionError ? (
            <TouchableOpacity onPress={() => loadVersion(version)} accessibilityRole="button">
              <Text style={styles.versionStatusError}>{t("today.confession.downloadFailed")}</Text>
            </TouchableOpacity>
          ) : null}

          <ScrollView ref={scrollRef} style={styles.body} contentContainerStyle={styles.bodyContent}>
            {versionLoading ? null : versionError ? null : verses ? (
              verses.map((v) => {
                if (!v.text || !v.text.trim()) {
                  const kjvText = kjvVerses?.find((kv) => kv.verse === v.verse)?.text;
                  return (
                    <View key={v.verse} style={styles.verseRow}>
                      <Text style={styles.omittedNote}>
                        <Text style={styles.verseNum}>{v.verse} </Text>
                        {kjvText
                          ? t("today.confession.verseOmittedWithText", { text: kjvText })
                          : t("today.confession.verseOmitted")}
                      </Text>
                    </View>
                  );
                }
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
                      {mark?.bookmark ? <Text style={styles.noteIndicator}> 🔖</Text> : null}
                      {mark?.note ? <Text style={styles.noteIndicator}> 📝</Text> : null}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.verseLine}>{t("today.confession.verseUnavailable")}</Text>
            )}
          </ScrollView>

          {selectedVerses.length > 0 && actionBarOpen ? (
            <View style={styles.actionBar}>
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
              ) : colorPickerOpen ? (
                <View style={styles.actionBarRow}>
                  <TouchableOpacity
                    onPress={() => setColorPickerOpen(false)}
                    accessibilityRole="button"
                    accessibilityLabel={t("today.confession.backToOptions")}
                    style={styles.iconBtn}
                  >
                    <Text style={styles.iconBtnText}>‹</Text>
                  </TouchableOpacity>
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
                </View>
              ) : (
                <View style={styles.actionBarRow}>
                  <Text style={styles.markToolbarLabel}>
                    {copiedFlash ? t("today.confession.copied") : t("today.confession.selectedCount", { count: selectedVerses.length })}
                  </Text>
                  <View style={styles.markToolbarActions}>
                    <TouchableOpacity onPress={handleCopy} accessibilityRole="button" accessibilityLabel={t("today.confession.copyVerse")} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>📋</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} accessibilityRole="button" accessibilityLabel={t("today.confession.shareVerse")} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>📤</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openNoteEditor} accessibilityRole="button" accessibilityLabel={t("today.confession.addNote")} style={styles.iconBtn}>
                      <Text style={styles.iconBtnText}>📝</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={applyBookmark}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.confession.bookmarkVerse")}
                      accessibilityState={{ selected: allBookmarked }}
                      style={[styles.iconBtn, allBookmarked && styles.iconBtnActive]}
                    >
                      <Text style={styles.iconBtnText}>🔖</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setColorPickerOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.confession.highlightVerse")}
                      accessibilityState={{ selected: !!commonColor || allUnderlined }}
                      style={[styles.iconBtn, (!!commonColor || allUnderlined) && styles.iconBtnActive]}
                    >
                      <Text style={styles.iconBtnText}>⭐</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={goPrev}
              disabled={versionLoading || currentChapter <= 1}
              style={[styles.navBtn, (versionLoading || currentChapter <= 1) && styles.navBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel={t("today.confession.prevChapter")}
            >
              <Text style={[styles.navBtnText, (versionLoading || currentChapter <= 1) && styles.navBtnTextDisabled]}>‹ {t("today.confession.prevChapter")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              disabled={versionLoading || currentChapter >= total}
              style={[styles.navBtn, (versionLoading || currentChapter >= total) && styles.navBtnDisabled]}
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
    versionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    versionRowLabel: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
    versionBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.bg,
    },
    versionBtnText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    versionDropdown: {
      position: "absolute",
      top: 44,
      right: 20,
      left: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      maxHeight: 220,
      zIndex: 30,
      ...shadow,
    },
    versionDropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    versionDropdownText: { fontSize: 13, color: colors.text },
    versionDropdownTextActive: { fontWeight: "700", color: colors.sageDark },
    versionStatus: {
      marginHorizontal: 20,
      marginTop: 8,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.verseCard,
      fontSize: 13,
      color: colors.textSoft,
    },
    versionStatusError: {
      marginHorizontal: 20,
      marginTop: 8,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.verseCard,
      fontSize: 13,
      fontWeight: "700",
      color: colors.sageDark,
      textDecorationLine: "underline",
    },
    actionBar: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.verseCard,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionBarRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
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
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtnActive: {
      backgroundColor: colors.verseCard,
      borderWidth: 1,
      borderColor: colors.sageDark,
    },
    iconBtnText: { fontSize: 19, textAlign: "center" },
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
    omittedNote: { fontSize: 14, lineHeight: 22, color: colors.textSoft, fontStyle: "italic" },
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
