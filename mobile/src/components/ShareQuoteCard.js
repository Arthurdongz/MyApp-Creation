import { forwardRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Rendered off-screen and captured to an image for sharing — see
// TodayScreen's captureAndShare. Fixed at 360x360 dp so it captures at a
// consistent, generous resolution on standard device pixel ratios.
const ShareQuoteCard = forwardRef(function ShareQuoteCard({ text, sourceLine, colors }, ref) {
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
      </View>
      <Text style={styles.watermark}>✦ Barnabas Journal</Text>
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
  watermark: {
    position: "absolute",
    bottom: 20,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(58,58,52,0.55)",
  },
});

export default ShareQuoteCard;
