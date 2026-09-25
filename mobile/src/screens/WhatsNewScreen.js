import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";
import { WHATS_NEW_RELEASES } from "../data/whatsNew";

// Shown once per version bump — see storage.js's showWhatsNew /
// dismissWhatsNew and ../data/whatsNew.js for how "new enough to
// announce" is tracked. Renders every release the user hasn't seen yet
// (in practice almost always just the latest one), newest first, so
// someone who skipped a few app opens in a row still gets the full
// picture rather than just the most recent entry.
export default function WhatsNewScreen({ onContinue }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const handleContinue = () => {
    hapticTap();
    onContinue();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mark}>✦</Text>
      <Text style={styles.title}>{t("whatsNew.title")}</Text>
      <Text style={styles.subtitle}>{t("whatsNew.subtitle")}</Text>

      {WHATS_NEW_RELEASES.map((release) => (
        <Card key={release.version} style={styles.releaseCard}>
          <View style={styles.releaseHeaderRow}>
            <Ionicons name={release.icon} size={20} color={colors.sageDark} />
            <Text style={styles.releaseHeading}>{t(`whatsNew.releases.${release.version}.heading`)}</Text>
          </View>
          {Array.from({ length: release.itemCount }, (_, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemBullet}>•</Text>
              <Text style={styles.itemText}>{t(`whatsNew.releases.${release.version}.items.${i}`)}</Text>
            </View>
          ))}
        </Card>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleContinue} accessibilityRole="button">
        <Text style={styles.buttonText}>{t("whatsNew.continueButton")}</Text>
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
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 22,
      paddingHorizontal: 6,
    },
    releaseCard: { width: "100%", marginBottom: 18 },
    releaseHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    releaseHeading: { fontSize: 15, fontWeight: "700", color: colors.sageDark },
    itemRow: { flexDirection: "row", gap: 8, marginBottom: 8, paddingRight: 4 },
    itemBullet: { fontSize: 14, color: colors.sageDark, lineHeight: 21 },
    itemText: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.text },
    button: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 32,
      marginTop: 6,
    },
    buttonText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 15 },
  });
}
