import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";

// "Did you know?" popup opened from the small icon next to a cross-reference
// plan day's connection text (see BibleReadingPlansScreen) — names which of
// the 12 interpretation principles (see ../data/interpretationPrinciples.js)
// is at work in that day's passage pairing, shows that principle's general
// definition, and a short note on how it specifically applies here. A day
// can carry more than one principle (e.g. both typology and Christological
// interpretation), so this renders a list, not a single fixed block.
export default function PrincipleModal({ visible, principleIds, note, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("interpretationPrinciples.icon")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 4 }}>
            {(principleIds || []).map((id, i) => (
              <View key={id} style={i > 0 ? styles.blockSpacing : null}>
                <Text style={styles.principleTitle}>{t(`interpretationPrinciples.${id}.title`)}</Text>
                <Text style={styles.principleDesc}>{t(`interpretationPrinciples.${id}.description`)}</Text>
              </View>
            ))}
            {note ? (
              <View style={styles.noteBlock}>
                <Text style={styles.noteLabel}>{t("bibleReadingPlans.crossReferencePlan.howItAppliesLabel")}</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ) : null}
          </ScrollView>
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
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: "100%",
      maxWidth: 420,
      maxHeight: "75%",
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.sageDark, flexShrink: 1, marginRight: 12 },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 13, color: colors.textSoft },
    body: {},
    blockSpacing: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    principleTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark, marginBottom: 6 },
    principleDesc: { fontSize: 14, lineHeight: 21, color: colors.text },
    noteBlock: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    noteLabel: { fontSize: 12, fontWeight: "700", color: colors.textSoft, marginBottom: 6, textTransform: "uppercase" },
    noteText: { fontSize: 14, lineHeight: 21, color: colors.text },
  });
}
