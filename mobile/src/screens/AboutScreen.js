import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";

const PRIVACY_POLICY_URL = "https://arthurdongz.github.io/MyApp-Creation/privacy-policy.html";
const CONTACT_EMAIL = "arthurdongz0711@gmail.com";
const APP_VERSION = "1.0.0";

export default function AboutScreen({ onClose }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("about.title", { brand: t("app.brand") })}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("about.closeLabel")} accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.paragraph}>{t("about.paragraph1")}</Text>
      <Text style={styles.paragraph}>{t("about.paragraph2")}</Text>
      <Text style={styles.paragraph}>{t("about.paragraph3")}</Text>

      <Text style={styles.meta}>{t("about.version", { version: APP_VERSION })}</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        accessibilityRole="link"
        accessibilityLabel={t("about.emailLabel", { email: CONTACT_EMAIL })}
      >
        <Text style={styles.metaLink}>{t("about.emailText", { email: CONTACT_EMAIL })}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        style={styles.footerLinkWrap}
        accessibilityRole="link"
        accessibilityLabel={t("common.privacyPolicy")}
      >
        <Text style={styles.footerLink}>{t("common.privacyPolicy")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { padding: 18, paddingBottom: 40 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    title: { fontSize: 20, fontWeight: "700", color: colors.sageDark, flex: 1, marginRight: 12 },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, color: colors.textSoft },
    paragraph: { fontSize: 14, lineHeight: 21, color: colors.text, marginBottom: 14 },
    meta: { fontSize: 13, color: colors.textSoft, marginTop: 8, marginBottom: 6 },
    metaLink: { fontSize: 13, color: colors.sageDark, marginBottom: 6 },
    footerLinkWrap: { marginTop: 24, alignItems: "center" },
    footerLink: { fontSize: 13, color: colors.textSoft, textDecorationLine: "underline" },
  });
}
