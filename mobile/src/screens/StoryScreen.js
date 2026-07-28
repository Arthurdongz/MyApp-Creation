import { useMemo, useState } from "react";
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
            <TouchableOpacity onPress={handleListen}>
              <Text style={styles.favoriteBtn}>🔊 Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSharePreview(true)}>
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title });
              }}
            >
              <Text style={[styles.favoriteBtn, storySaved && styles.favoriteBtnActive]}>
                {storySaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyText}>{story.text}</Text>
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
  });
}
