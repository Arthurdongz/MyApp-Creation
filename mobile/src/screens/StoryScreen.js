import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Card from "../components/Card";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDaySmallBank } from "../content";
import { STORIES } from "../data/stories";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

export default function StoryScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { viewingDay, order, settings, updateSettings, isFavorited, toggleFavorite } = store;

  const story = useMemo(() => pickForDaySmallBank(STORIES, viewingDay, order), [viewingDay, order]);
  const storySaved = isFavorited("truestory", viewingDay);

  const [sharePreview, setSharePreview] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    setShowInsight(false);
  }, [viewingDay]);

  const handleListen = () => {
    speak(`${story.title}. ${story.text}`, settings);
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
            <TouchableOpacity onPress={handleListen} accessibilityRole="button" accessibilityLabel="Listen to today's story">
              <Text style={styles.favoriteBtn}>🔊 Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSharePreview(true)}
              accessibilityRole="button"
              accessibilityLabel="Share today's story"
            >
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title });
              }}
              accessibilityRole="button"
              accessibilityLabel={storySaved ? "Saved — tap to remove from favorites" : "Save to favorites"}
              accessibilityState={{ selected: storySaved }}
            >
              <Text style={[styles.favoriteBtn, storySaved && styles.favoriteBtnActive]}>
                {storySaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyText}>{story.text}</Text>
        <View style={styles.insightRow}>
          <TouchableOpacity
            onPress={() => {
              hapticTap();
              setShowInsight((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel="Show the lesson behind this story"
            accessibilityState={{ expanded: showInsight }}
          >
            <Text style={[styles.insightBtn, showInsight && styles.insightBtnActive]} maxFontSizeMultiplier={1.3}>
              i
            </Text>
          </TouchableOpacity>
        </View>
        {showInsight && (
          <View style={styles.insightPanel}>
            <Text style={styles.insightLabel}>What it meant</Text>
            <Text style={styles.insightText}>{story.insight}</Text>
          </View>
        )}
      </Card>

      <SharePreviewModal
        visible={sharePreview}
        mainText={story.text}
        sourceLine={story.title}
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setSharePreview(false)}
      />
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
    favoriteBtnActive: { color: colors.goldText, borderColor: colors.goldText },
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
    insightRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
    },
    insightBtn: {
      width: 26,
      height: 26,
      lineHeight: 24,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: colors.sageDark,
      color: colors.sageDark,
      fontSize: 14,
      fontWeight: "700",
      fontStyle: "italic",
      textAlign: "center",
      overflow: "hidden",
    },
    insightBtnActive: {
      backgroundColor: colors.sageDark,
      color: colors.card,
    },
    insightPanel: {
      marginTop: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    insightLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontSize: 11,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 6,
    },
    insightText: {
      fontSize: 14,
      lineHeight: 21,
      fontStyle: "italic",
      color: colors.text,
    },
  });
}
