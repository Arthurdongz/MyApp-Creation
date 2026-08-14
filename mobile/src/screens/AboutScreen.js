import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

const PRIVACY_POLICY_URL = "https://arthurdongz.github.io/MyApp-Creation/privacy-policy.html";
const CONTACT_EMAIL = "arthurdongz0711@gmail.com";

export default function AboutScreen({ onClose }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About Barnabas Journal</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close about" accessibilityRole="button">
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.paragraph}>
        Barnabas Journal exists to put a little encouragement into your day — one verse, one
        quote, and one true story of someone showing up for another person, each day.
      </Text>
      <Text style={styles.paragraph}>
        It's named for Barnabas, called "Son of Encouragement" in Acts 4:36 — a man who
        introduced the outcast, gave second chances, and stood by people others had given up on.
      </Text>
      <Text style={styles.paragraph}>
        Our hope is simple: that this app helps you carry a little more hope into your day, and
        gives you an easy way to pass it on to someone else. No matter your background, your
        faith, or the season of life you're in, there's something here for you.
      </Text>

      <Text style={styles.meta}>Version 1.0.0</Text>
      <TouchableOpacity
        onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        accessibilityRole="link"
        accessibilityLabel={`Email us at ${CONTACT_EMAIL}`}
      >
        <Text style={styles.metaLink}>Questions or feedback: {CONTACT_EMAIL}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        style={styles.footerLinkWrap}
        accessibilityRole="link"
        accessibilityLabel="Privacy Policy"
      >
        <Text style={styles.footerLink}>Privacy Policy</Text>
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
