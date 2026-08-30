import { forwardRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

// Capped well short of the card's fixed height so a long saved reflection
// can't push the watermark off the bottom of the 360x360 capture area.
const REFLECTION_MAX_LEN = 130;

function truncateReflection(text) {
  const trimmed = text.trim();
  return trimmed.length > REFLECTION_MAX_LEN
    ? `${trimmed.slice(0, REFLECTION_MAX_LEN).trimEnd()}…`
    : trimmed;
}

// Rendered off-screen and captured to an image for sharing — see
// TodayScreen's captureAndShare. Fixed at 360x360 dp so it captures at a
// consistent, generous resolution on standard device pixel ratios.
// reflectionText is optional — passed through only when the user opted in
// via SharePreviewModal's "include my own reflection" toggle.
const ShareQuoteCard = forwardRef(function ShareQuoteCard({ text, sourceLine, colors, reflectionText }, ref) {
  const { t } = useTranslation();
  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <LinearGradient
        colors={colors || ["#f7dca3", "#6f9578"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.quote}>“{text}”</Text>
        {sourceLine ? <Text style={styles.source}>{sourceLine}</Text> : null}
        {reflectionText && reflectionText.trim() ? (
          <View style={styles.reflectionBlock}>
            <Text style={styles.reflectionLabel}>{t("share.myReflectionLabel")}</Text>
            <Text style={styles.reflectionText}>“{truncateReflection(reflectionText)}”</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.watermark}>{t("share.watermark", { brand: t("app.brand") })}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 360,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 32 },
  quote: {
    fontSize: 19,
    lineHeight: 25,
    textAlign: "center",
    color: "#3a3a34",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  source: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    color: "#3f5548",
    marginTop: 14,
  },
  reflectionBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(58,58,52,0.2)",
  },
  reflectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    color: "rgba(58,58,52,0.7)",
    marginBottom: 6,
  },
  reflectionText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontStyle: "italic",
    textAlign: "center",
    color: "#3a3a34",
  },
  watermark: {
    position: "absolute",
    bottom: 20,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(58,58,52,0.55)",
  },
});

export default ShareQuoteCard;
