import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { CRISIS_REGION_LABELS, OTHER_REGION, sortedCrisisRegionCodes } from "../crisisResources";
import { hapticTap } from "../haptics";

export default function OnboardingScreen({ onStart, settings, updateSettings }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mark}>✦</Text>
      <Text style={styles.title}>{t("onboarding.welcomeTitle")}</Text>
      <Text style={styles.paragraph}>{t("onboarding.paragraph1")}</Text>
      <Text style={styles.paragraph}>{t("onboarding.paragraph2")}</Text>
      <Text style={styles.paragraph}>{t("onboarding.paragraph3")}</Text>
      <Text style={styles.paragraph}>{t("onboarding.paragraph4")}</Text>

      <View style={styles.crisisRegionCard}>
        <Text style={styles.crisisRegionTitle}>{t("onboarding.crisisRegionTitle")}</Text>
        <Text style={styles.crisisRegionSubtitle}>{t("onboarding.crisisRegionSubtitle")}</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={[styles.presetBtn, !settings.crisisRegionOverride && styles.presetBtnActive]}
            onPress={() => {
              hapticTap();
              updateSettings({ crisisRegionOverride: null });
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: !settings.crisisRegionOverride }}
          >
            <Text style={[styles.presetText, !settings.crisisRegionOverride && styles.presetTextActive]}>
              {t("settings.crisisRegionAuto")}
            </Text>
          </TouchableOpacity>
          {sortedCrisisRegionCodes().map((code) => {
            const active = settings.crisisRegionOverride === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.presetBtn, active && styles.presetBtnActive]}
                onPress={() => {
                  hapticTap();
                  updateSettings({ crisisRegionOverride: code });
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>
                  {CRISIS_REGION_LABELS[code]}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.presetBtn, settings.crisisRegionOverride === OTHER_REGION && styles.presetBtnActive]}
            onPress={() => {
              hapticTap();
              updateSettings({ crisisRegionOverride: OTHER_REGION });
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: settings.crisisRegionOverride === OTHER_REGION }}
          >
            <Text
              style={[
                styles.presetText,
                settings.crisisRegionOverride === OTHER_REGION && styles.presetTextActive,
              ]}
            >
              {t("settings.crisisRegionOther")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onStart} accessibilityRole="button">
        <Text style={styles.buttonText}>{t("onboarding.startButton")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 28,
    },
    mark: { fontSize: 32, color: colors.gold, marginBottom: 8 },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.sageDark,
      textAlign: "center",
      marginBottom: 16,
    },
    paragraph: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 14,
    },
    button: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginTop: 8,
    },
    buttonText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 15 },
    crisisRegionCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      width: "100%",
      marginTop: 4,
      marginBottom: 8,
    },
    crisisRegionTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark, marginBottom: 6 },
    crisisRegionSubtitle: { fontSize: 13, color: colors.textSoft, lineHeight: 18, marginBottom: 12 },
    presetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    presetBtn: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    presetBtnActive: { backgroundColor: colors.buttonBg, borderColor: colors.buttonBg },
    presetText: { fontSize: 12, fontWeight: "600", color: colors.textSoft },
    presetTextActive: { color: colors.buttonOnText },
  });
}
