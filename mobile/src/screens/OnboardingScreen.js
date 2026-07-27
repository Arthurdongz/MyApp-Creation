import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

export default function OnboardingScreen({ onStart }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mark}>✦</Text>
      <Text style={styles.title}>Welcome to Barnabas Journal</Text>
      <Text style={styles.paragraph}>
        In the book of Acts, a man named Joseph was given a new name by the apostles: Barnabas —
        "son of encouragement." He had a gift for lifting others up with a kind word or a
        well-timed act of generosity.
      </Text>
      <Text style={styles.paragraph}>
        This journal gives you a new verse, a word of encouragement, and a small "Barnabas moment"
        to do for someone else — one day at a time. A new day unlocks every day; you can always
        look back on days you've already lived, but not skip ahead.
      </Text>
      <Text style={styles.paragraph}>
        Show up, be kind, and reflect a little. Stars, streaks, and badges are just there to
        notice how far you've come.
      </Text>
      <Text style={styles.paragraph}>
        We'll ask permission to send two gentle reminders each day — a morning verse, and an
        evening nudge to reflect — you can turn either off anytime from the Rewards tab.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Begin your journey</Text>
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
      backgroundColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginTop: 8,
    },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  });
}
