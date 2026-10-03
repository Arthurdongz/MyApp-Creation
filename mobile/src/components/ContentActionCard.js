import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Card from "./Card";
import { useTheme } from "../theme";

// The label row + Listen/Share/Save action row that StoryScreen and
// FactScreen both rendered identically (same favoriteBtn styling, same
// three-button pattern and accessibility states) around otherwise
// completely different content — a story's title/body/insight-toggle vs a
// fact's single text block. Callers own that content entirely via
// `children`; this only ever renders the card chrome around it.
export default function ContentActionCard({
  cardStyle,
  label,
  onListen,
  listenLabel,
  onShare,
  shareLabel,
  saved,
  onToggleSave,
  saveLabel,
  savedLabel,
  children,
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <Card style={cardStyle}>
      <View style={styles.cardLabelRow}>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={styles.cardLabelActions}>
          <TouchableOpacity onPress={onListen} accessibilityRole="button" accessibilityLabel={listenLabel}>
            <Text style={styles.favoriteBtn}>{t("common.listen")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} accessibilityRole="button" accessibilityLabel={shareLabel}>
            <Text style={styles.favoriteBtn}>{t("common.share")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleSave}
            accessibilityRole="button"
            accessibilityLabel={saved ? savedLabel : saveLabel}
            accessibilityState={{ selected: saved }}
          >
            <Text style={[styles.favoriteBtn, saved && styles.favoriteBtnActive]}>
              {saved ? t("common.saved") : t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {children}
    </Card>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
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
  });
}
