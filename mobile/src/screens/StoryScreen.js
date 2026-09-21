import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import ContentActionCard from "../components/ContentActionCard";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDaySmallBank } from "../content";
import { loadStories } from "../data/byLang";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

export default function StoryScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const storiesBank = loadStories(i18n.language);
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

      <ContentActionCard
        cardStyle={styles.storyCard}
        label={t("story.cardLabel")}
        onListen={handleListen}
        listenLabel={t("story.listenLabel")}
        onShare={() => setSharePreview(true)}
        shareLabel={t("story.shareLabel")}
        saved={storySaved}
        onToggleSave={() => {
          hapticTap();
          toggleFavorite("truestory", viewingDay, { text: story.text, title: story.title });
        }}
        saveLabel={t("common.saveToFavorites")}
        savedLabel={t("common.savedRemoveFromFavorites")}
      >
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
            {story.source ? (
              <View style={styles.sourceRow}>
                <Text style={styles.sourceLabel}>{t("story.sourceTitle")}</Text>
                <Text style={styles.sourceText}>{story.source}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ContentActionCard>

      <SharePreviewModal
        visible={sharePreview}
        mainText={story.text}
        sourceLine={story.title}
        reflectionText={store.state.entries[`day-${viewingDay}`]?.reflection || ""}
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
    sourceRow: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sourceLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontSize: 10,
      fontWeight: "700",
      color: colors.textSoft,
      marginBottom: 3,
    },
    sourceText: {
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.textSoft,
    },
  });
}
