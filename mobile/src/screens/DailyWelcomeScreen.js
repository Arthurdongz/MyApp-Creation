import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import { useTheme } from "../theme";
import { pickForDay, pickForDaySmallBank } from "../content";
import { HIGHLIGHTS } from "../data/highlights";
import { HIGHLIGHTS_ES } from "../data/highlights.es";
import { HIGHLIGHTS_PT } from "../data/highlights.pt";
import { HIGHLIGHTS_FR } from "../data/highlights.fr";
import { WELCOME_TEASERS } from "../data/welcomeTeasers";
import { WELCOME_TEASERS_ES } from "../data/welcomeTeasers.es";
import { WELCOME_TEASERS_PT } from "../data/welcomeTeasers.pt";
import { WELCOME_TEASERS_FR } from "../data/welcomeTeasers.fr";
import { hapticTap } from "../haptics";

const HIGHLIGHTS_BY_LANG = { es: HIGHLIGHTS_ES, pt: HIGHLIGHTS_PT, fr: HIGHLIGHTS_FR };
const WELCOME_TEASERS_BY_LANG = { es: WELCOME_TEASERS_ES, pt: WELCOME_TEASERS_PT, fr: WELCOME_TEASERS_FR };

// A once-a-day gate shown before the main app, on the first open of each
// calendar day only (see storage.js's showDailyWelcome/dismissDailyWelcome).
// Deliberately built the same way every other piece of daily content in
// this app is: picked deterministically from a local bank by day number,
// so it's instant, works offline, and never repeats the same pairing two
// days running — no network call, no AI generation, nothing that could
// fail or feel inconsistent on the one screen every single user sees
// every single day.
export default function DailyWelcomeScreen({ store, onContinue }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const highlightsBank = HIGHLIGHTS_BY_LANG[i18n.language] || HIGHLIGHTS;
  const teasersBank = WELCOME_TEASERS_BY_LANG[i18n.language] || WELCOME_TEASERS;

  const { latestDay, order, streak, settings } = store;
  const fact = pickForDay(highlightsBank, latestDay, order);
  const teaser = pickForDaySmallBank(teasersBank, latestDay, order);
  const name = (settings.userName || "").trim();

  const handleContinue = () => {
    hapticTap();
    onContinue();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mark}>✦</Text>
      <Text style={styles.title}>
        {name ? t("dailyWelcome.greetingNamed", { name }) : t("dailyWelcome.greetingGeneric")}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{t("dailyWelcome.dayLine", { day: latestDay })}</Text>
        {streak > 1 ? (
          <View style={styles.streakChip}>
            <Ionicons name="flame" size={13} color={colors.sageDark} />
            <Text style={styles.streakChipText}>{t("dailyWelcome.streakLine", { count: streak })}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.teaser}>{teaser}</Text>

      <Card style={styles.factCard}>
        <Text style={styles.factLabel}>{t("dailyWelcome.factLabel")}</Text>
        <Text style={styles.factText}>{fact}</Text>
      </Card>

      <TouchableOpacity style={styles.button} onPress={handleContinue} accessibilityRole="button">
        <Text style={styles.buttonText}>{t("dailyWelcome.continueButton")}</Text>
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
      fontSize: 21,
      fontWeight: "700",
      color: colors.sageDark,
      textAlign: "center",
      marginBottom: 14,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 18,
    },
    metaText: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
    streakChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 10,
    },
    streakChipText: { fontSize: 12.5, fontWeight: "700", color: colors.sageDark },
    teaser: {
      fontSize: 16,
      lineHeight: 23,
      color: colors.text,
      textAlign: "center",
      fontStyle: "italic",
      marginBottom: 22,
      paddingHorizontal: 6,
    },
    factCard: { width: "100%", marginBottom: 26 },
    factLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontSize: 11,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 8,
    },
    factText: { fontSize: 14.5, lineHeight: 21, color: colors.text },
    button: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 32,
    },
    buttonText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 15 },
  });
}
