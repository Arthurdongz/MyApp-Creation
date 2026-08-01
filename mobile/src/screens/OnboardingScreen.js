import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";

export default function OnboardingScreen({ onStart }) {
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
  });
}
