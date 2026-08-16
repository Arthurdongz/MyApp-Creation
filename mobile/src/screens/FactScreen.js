import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDay } from "../content";
import { HIGHLIGHTS } from "../data/highlights";
import { HIGHLIGHTS_ES } from "../data/highlights.es";
import { HIGHLIGHTS_PT } from "../data/highlights.pt";
import { HIGHLIGHTS_FR } from "../data/highlights.fr";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

const HIGHLIGHTS_BY_LANG = { es: HIGHLIGHTS_ES, pt: HIGHLIGHTS_PT, fr: HIGHLIGHTS_FR };

export default function FactScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const highlightsBank = HIGHLIGHTS_BY_LANG[i18n.language] || HIGHLIGHTS;
  const { viewingDay, order, settings, updateSettings, isFavorited, toggleFavorite } = store;

  const fact = pickForDay(highlightsBank, viewingDay, order);
  const factSaved = isFavorited("highlight", viewingDay);

  const [sharePreview, setSharePreview] = useState(false);

  return (
    <View>
      <Text style={styles.title}>{t("fact.title")}</Text>
      <Text style={styles.subtitle}>{t("fact.subtitle")}</Text>

      <Card style={styles.factCard}>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>{t("fact.cardLabel")}</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity
              onPress={() => speak(fact, settings)}
              accessibilityRole="button"
              accessibilityLabel={t("fact.listenLabel")}
            >
              <Text style={styles.favoriteBtn}>{t("common.listen")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSharePreview(true)}
              accessibilityRole="button"
              accessibilityLabel={t("fact.shareLabel")}
            >
              <Text style={styles.favoriteBtn}>{t("common.share")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("highlight", viewingDay, { text: fact, source: t("app.brand") });
              }}
              accessibilityRole="button"
              accessibilityLabel={factSaved ? t("common.savedRemoveFromFavorites") : t("common.saveToFavorites")}
              accessibilityState={{ selected: factSaved }}
            >
              <Text style={[styles.favoriteBtn, factSaved && styles.favoriteBtnActive]}>
                {factSaved ? t("common.saved") : t("common.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.factText}>{fact}</Text>
      </Card>

      <SharePreviewModal
        visible={sharePreview}
        mainText={fact}
        sourceLine={t("app.brand")}
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
    cardLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
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
    factText: {
      fontSize: 16,
      lineHeight: 23,
      color: colors.text,
    },
  });
}
