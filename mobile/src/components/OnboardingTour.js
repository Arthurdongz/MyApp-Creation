import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

// A short, one-time coach-mark sequence shown after the welcome onboarding
// screen — pointing out UI added since the app's early screens (jump links,
// the Facts/Story/Journal/Favorites tabs, saving to Favorites) that a first
// glance at Today alone wouldn't surface. Gated by settings.tourShown so it
// only ever plays once per install, for both brand-new and existing users.
const STEPS = [
  {
    emoji: "📅",
    title: "Look back anytime",
    text: "The day navigator lets you revisit any day you've already lived. You can always look back, but you can't skip ahead of today.",
  },
  {
    emoji: "🔗",
    title: "Jump straight to what you want",
    text: "The quick links under the day navigator — Verse · Word · Moment · Reflect — scroll you straight to that part of the page.",
  },
  {
    emoji: "🗂️",
    title: "More to explore",
    text: "The tabs up top hold a true Story, a Fact of the Day, your Journal of past entries, and everything you've saved to Favorites.",
  },
  {
    emoji: "☆",
    title: "Save what moves you",
    text: "Tap Save — or ☆ Save in a card's ••• menu — on any verse, quote, story, or fact to keep it in Favorites for later.",
  },
];

export default function OnboardingTour({ visible, onFinish }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    hapticTap();
    if (isLast) {
      onFinish();
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    hapticTap();
    onFinish();
    setStep(0);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleSkip}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip tour"
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.text}>{current.text}</Text>

          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? "Got it, finish tour" : "Next tip"}
          >
            <Text style={styles.buttonText}>{isLast ? "Got it!" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(20, 24, 18, 0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      width: "100%",
      maxWidth: 360,
      alignItems: "center",
      ...shadow,
    },
    skipBtn: { alignSelf: "flex-end", marginBottom: 4 },
    skipBtnText: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
    emoji: { fontSize: 34, marginBottom: 10 },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.sageDark,
      textAlign: "center",
      marginBottom: 10,
    },
    text: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.text,
      textAlign: "center",
      marginBottom: 18,
    },
    dotsRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: { backgroundColor: colors.sage, width: 18 },
    button: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 32,
      alignItems: "center",
      alignSelf: "stretch",
    },
    buttonText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
  });
}
