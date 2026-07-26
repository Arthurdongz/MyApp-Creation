import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Speech from "expo-speech";
import Card from "../components/Card";
import ShareQuoteCard from "../components/ShareQuoteCard";
import { useTheme } from "../theme";
import { pickForDaySmallBank } from "../content";
import { STORIES } from "../data/stories";

export default function StoryScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { viewingDay, order, isFavorited, toggleFavorite } = store;

  const story = useMemo(() => pickForDaySmallBank(STORIES, viewingDay, order), [viewingDay, order]);
  const storySaved = isFavorited("truestory", viewingDay);

  const shareCardRef = useRef(null);
  const [shareCardContent, setShareCardContent] = useState(null);
  const [shareMsg, setShareMsg] = useState("");

  // Clear any leftover share message when the viewed day changes.
  useEffect(() => {
    setShareMsg("");
  }, [viewingDay]);

  const handleShare = async () => {
    setShareCardContent({ text: story.text, sourceLine: story.title });
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      const uri = await captureRef(shareCardRef, { format: "png", quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share from Barnabas Journal" });
      }
      setShareMsg("Shared. Thank you for passing it on!");
    } catch (e) {
      setShareMsg("Couldn't create the share image right now.");
    }
    setTimeout(() => setShareMsg(""), 4000);
  };

  const handleListen = () => {
    Speech.stop();
    Speech.speak(`${story.title}. ${story.text}`, { rate: 0.95 });
  };

  return (
    <View>
      <Text style={styles.title}>Story of the Day</Text>
      <Text style={styles.subtitle}>
        A true story of someone showing the good side of humanity — the Barnabas effect, at work in real life.
      </Text>

      <Card style={styles.storyCard}>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>True Story</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity onPress={handleListen}>
              <Text style={styles.favoriteBtn}>🔊 Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title })}
            >
              <Text style={[styles.favoriteBtn, storySaved && styles.favoriteBtnActive]}>
                {storySaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyText}>{story.text}</Text>
        {shareMsg ? <Text style={styles.shareMsg}>{shareMsg}</Text> : null}
      </Card>

      <View style={styles.hiddenCapture} pointerEvents="none">
        <ShareQuoteCard
          ref={shareCardRef}
          text={shareCardContent?.text || ""}
          sourceLine={shareCardContent?.sourceLine || ""}
        />
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 18 },
    storyCard: { backgroundColor: colors.storyCard },
    cardLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardLabelActions: {
      flexDirection: "row",
      gap: 6,
    },
    cardLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontSize: 11,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 10,
    },
    favoriteBtn: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 9,
      marginBottom: 10,
      overflow: "hidden",
    },
    favoriteBtnActive: { color: colors.gold, borderColor: colors.gold },
    storyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    storyText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    shareMsg: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: "600",
      color: colors.sageDark,
    },
    hiddenCapture: {
      position: "absolute",
      top: -10000,
      left: 0,
    },
  });
}
