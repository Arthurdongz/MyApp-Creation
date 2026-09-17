import { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { lookupRef } from "../bibleLookup";
import { hapticTap } from "../haptics";
import BibleChapterModal from "./BibleChapterModal";

// A compact "tap the reference, see the verse" popup — opened from the
// Verse-of-the-day and Confession cards' scripture references. Shows the
// resolved KJV text for every piece of the ref (a ref can name more than
// one book/chapter, e.g. "Isaiah 43:25, Jeremiah 31:34"), and offers a way
// into the full chapter via BibleChapterModal for whichever piece the
// reader taps "Read more" on.
export default function VersePopup({ visible, scriptureRef: reference, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [chapterTarget, setChapterTarget] = useState(null);

  const blocks = reference ? lookupRef(reference) : null;

  // Closes this popup's own Modal at the same moment the chapter reader
  // opens its Modal — two RN <Modal>s visible at once is fine on Android
  // but iOS's native modal presentation can silently fail to show the
  // second one, so only one of the two is ever visible at a time.
  // chapterTarget lives in this component's own state (not gated behind
  // the `visible` prop), so it keeps tracking correctly even once the
  // parent hides this popup.
  const openChapter = (block) => {
    hapticTap();
    onClose();
    setChapterTarget(block);
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{reference}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 4 }}>
              {blocks ? (
                blocks.map((block, i) => (
                  <View key={i} style={i > 0 ? styles.blockSpacing : null}>
                    <Text style={styles.verseText}>
                      {block.verses.map((v, vi) => (
                        <Text key={v.verse}>
                          {block.verses.length > 1 ? <Text style={styles.verseNum}>{v.verse} </Text> : null}
                          {v.text}
                          {vi < block.verses.length - 1 ? " " : ""}
                        </Text>
                      ))}
                    </Text>
                    <View style={styles.blockFooter}>
                      <Text style={styles.blockRef}>
                        {block.book} {block.chapter}
                        {block.verseStart === block.verseEnd ? `:${block.verseStart}` : `:${block.verseStart}-${block.verseEnd}`} (KJV)
                      </Text>
                      <TouchableOpacity onPress={() => openChapter(block)} accessibilityRole="button">
                        <Text style={styles.readMoreLink}>{t("today.confession.readChapter")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.verseText}>{t("today.confession.verseUnavailable")}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BibleChapterModal
        key={chapterTarget ? `${chapterTarget.book}-${chapterTarget.chapter}` : "closed"}
        visible={!!chapterTarget}
        book={chapterTarget?.book}
        chapter={chapterTarget?.chapter}
        highlightStart={chapterTarget?.verseStart}
        highlightEnd={chapterTarget?.verseEnd}
        onClose={() => setChapterTarget(null)}
      />
    </>
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
      padding: 20,
      width: "100%",
      maxWidth: 420,
      maxHeight: "75%",
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.sageDark, flexShrink: 1, marginRight: 12 },
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
    body: {},
    blockSpacing: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    verseText: { fontSize: 16, lineHeight: 24, color: colors.text },
    verseNum: { fontSize: 12, fontWeight: "700", color: colors.sage },
    blockFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    blockRef: { fontSize: 13, color: colors.textSoft, fontWeight: "600" },
    readMoreLink: { fontSize: 13, color: colors.sageDark, fontWeight: "700" },
  });
}
