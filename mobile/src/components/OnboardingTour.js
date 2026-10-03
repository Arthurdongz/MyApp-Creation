import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

// A short, one-time coach-mark sequence shown after the welcome onboarding
// screen — pointing out UI added since the app's early screens (jump links,
// the Facts/Story/Journal/Favorites tabs, saving to Favorites) that a first
// glance at Today alone wouldn't surface. Gated by settings.tourShown so it
// only ever plays once per install, for both brand-new and existing users.
const STEP_KEYS = [
  { icon: "calendar-outline", key: "lookBack" },
  { icon: "link-outline", key: "jumpLinks" },
  { icon: "folder-open-outline", key: "moreToExplore" },
  { icon: "menu-outline", key: "menuExtras" },
  { icon: "star-outline", key: "saveWhatMoves" },
  { icon: "earth-outline", key: "crisisRegion" },
];

export default function OnboardingTour({ visible, onFinish }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const STEPS = STEP_KEYS.map((s) => ({
    icon: s.icon,
    title: t(`tour.steps.${s.key}.title`),
    text: t(`tour.steps.${s.key}.text`),
  }));

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  // A screen reader has no other way to notice the card's text changed —
  // tapping Next/Skip only ever moves accessibility focus off the button it
  // already had focus on, it never lands on the new title/body underneath.
  // Without this, a screen-reader user would have to manually re-explore
  // the whole card after every tap just to find out anything changed.
  // Skipped on the mount that merely flips `visible` false->true unmounting
  // the Modal (nothing to announce there); the initial step's content is
  // still announced naturally when the Modal appears and VoiceOver/TalkBack
  // reads what's now on screen.
  const wasVisible = useRef(visible);
  useEffect(() => {
    if (!visible) {
      wasVisible.current = false;
      return;
    }
    if (wasVisible.current) {
      AccessibilityInfo.announceForAccessibility(
        t("tour.stepAnnouncement", { current: step + 1, total: STEPS.length, title: current.title, text: current.text })
      );
    }
    wasVisible.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step]);

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
            accessibilityLabel={t("tour.skipLabel")}
          >
            <Text style={styles.skipBtnText}>{t("tour.skip")}</Text>
          </TouchableOpacity>

          <Ionicons
            name={current.icon}
            size={34}
            color={colors.sageDark}
            style={styles.emoji}
            accessible={false}
            importantForAccessibility="no"
          />
          <Text style={styles.title} accessibilityRole="header">
            {current.title}
          </Text>
          <Text style={styles.text}>{current.text}</Text>

          <View
            style={styles.dotsRow}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t("tour.stepProgressLabel")}
            accessibilityValue={{ min: 1, max: STEPS.length, now: step + 1 }}
          >
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t("tour.finishLabel") : t("tour.nextLabel")}
          >
            <Text style={styles.buttonText}>{isLast ? t("tour.finish") : t("tour.next")}</Text>
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
    emoji: { marginBottom: 10 },
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
