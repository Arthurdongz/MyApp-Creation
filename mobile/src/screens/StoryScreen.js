import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDaySmallBank } from "../content";
import { STORIES } from "../data/stories";
import { STORIES_ES } from "../data/stories.es";
import { STORIES_PT } from "../data/stories.pt";
import { STORIES_FR } from "../data/stories.fr";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

const STORIES_BY_LANG = { es: STORIES_ES, pt: STORIES_PT, fr: STORIES_FR };

export default function StoryScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const storiesBank = STORIES_BY_LANG[i18n.language] || STORIES;
  const { viewingDay, order, settings, updateSettings, isFavorited, toggleFavorite } = store;

  const story = useMemo(() => pickForDaySmallBank(storiesBank, viewingDay, order), [storiesBank, viewingDay, order]);
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
      <Text style={styles.title}>{t("story.title")}</Text>
      <Text style={styles.subtitle}>{t("story.subtitle")}</Text>

      <Card style={styles.storyCard}>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>{t("story.cardLabel")}</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity onPress={handleListen} accessibilityRole="button" accessibilityLabel={t("story.listenLabel")}>
              <Text style={styles.favoriteBtn}>{t("common.listen")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSharePreview(true)}
              accessibilityRole="button"
              accessibilityLabel={t("story.shareLabel")}
            >
              <Text style={styles.favoriteBtn}>{t("common.share")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title });
              }}
              accessibilityRole="button"
              accessibilityLabel={storySaved ? t("common.savedRemoveFromFavorites") : t("common.saveToFavorites")}
              accessibilityState={{ selected: storySaved }}
            >
              <Text style={[styles.favoriteBtn, storySaved && styles.favoriteBtnActive]}>
                {storySaved ? t("common.saved") : t("common.save")}
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
            accessibilityLabel={t("story.insightLabel")}
            accessibilityState={{ expanded: showInsight }}
          >
            <Text style={[styles.insightBtn, showInsight && styles.insightBtnActive]} maxFontSizeMultiplier={1.3}>
              i
            </Text>
          </TouchableOpacity>
        </View>
        {showInsight && (
          <View style={styles.insightPanel}>
            <Text style={styles.insightLabel}>{t("story.insightTitle")}</Text>
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
