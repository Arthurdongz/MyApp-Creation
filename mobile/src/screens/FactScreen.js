import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ContentActionCard from "../components/ContentActionCard";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDay } from "../content";
import { loadHighlights } from "../data/byLang";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

export default function FactScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const highlightsBank = loadHighlights(i18n.language);
  const { viewingDay, order, settings, updateSettings, isFavorited, toggleFavorite } = store;

  const fact = pickForDay(highlightsBank, viewingDay, order);
  const factSaved = isFavorited("highlight", viewingDay);

  const [sharePreview, setSharePreview] = useState(false);

  return (
    <View>
      <Text style={styles.title}>{t("fact.title")}</Text>
      <Text style={styles.subtitle}>{t("fact.subtitle")}</Text>

      <ContentActionCard
        cardStyle={styles.factCard}
        label={t("fact.cardLabel")}
        onListen={() => speak(fact, settings)}
        listenLabel={t("fact.listenLabel")}
        onShare={() => setSharePreview(true)}
        shareLabel={t("fact.shareLabel")}
        saved={factSaved}
        onToggleSave={() => {
          hapticTap();
          toggleFavorite("highlight", viewingDay, { text: fact, source: t("app.brand") });
        }}
        saveLabel={t("common.saveToFavorites")}
        savedLabel={t("common.savedRemoveFromFavorites")}
      >
        <Text style={styles.factText}>{fact}</Text>
      </ContentActionCard>

      <SharePreviewModal
        visible={sharePreview}
        mainText={fact}
        sourceLine={t("app.brand")}
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
    factCard: { backgroundColor: colors.factCard },
    factText: {
      fontSize: 16,
      lineHeight: 23,
      color: colors.text,
    },
  });
}
