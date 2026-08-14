import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDay } from "../content";
import { HIGHLIGHTS } from "../data/highlights";
import { HIGHLIGHTS_ES } from "../data/highlights.es";
import { speak } from "../speech";
import { hapticTap } from "../haptics";

export default function FactScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { i18n } = useTranslation();
  const highlightsBank = i18n.language === "es" ? HIGHLIGHTS_ES : HIGHLIGHTS;
  const { viewingDay, order, settings, updateSettings, isFavorited, toggleFavorite } = store;

  const fact = pickForDay(highlightsBank, viewingDay, order);
  const factSaved = isFavorited("highlight", viewingDay);

  const [sharePreview, setSharePreview] = useState(false);

  return (
    <View>
      <Text style={styles.title}>Fact of the Day</Text>
      <Text style={styles.subtitle}>
        A short, real finding about kindness, connection, or hope — meant to nudge you toward your Barnabas
        Moment.
      </Text>

      <Card style={styles.factCard}>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>Did You Know?</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity
              onPress={() => speak(fact, settings)}
              accessibilityRole="button"
              accessibilityLabel="Listen to today's fact"
            >
              <Text style={styles.favoriteBtn}>🔊 Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSharePreview(true)}
              accessibilityRole="button"
              accessibilityLabel="Share today's fact"
            >
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("highlight", viewingDay, { text: fact, source: "Barnabas Journal" });
              }}
              accessibilityRole="button"
              accessibilityLabel={factSaved ? "Saved — tap to remove from favorites" : "Save to favorites"}
              accessibilityState={{ selected: factSaved }}
            >
              <Text style={[styles.favoriteBtn, factSaved && styles.favoriteBtnActive]}>
                {factSaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.factText}>{fact}</Text>
      </Card>

      <SharePreviewModal
        visible={sharePreview}
        mainText={fact}
        sourceLine="Barnabas Journal"
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
