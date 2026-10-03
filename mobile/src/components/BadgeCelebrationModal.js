import { useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { hapticSuccess } from "../haptics";
import AppIcon from "./AppIcon";

// A one-time popup for the moment a badge's threshold is first crossed —
// surfaced from storage.js's newlyEarnedBadge, which only ever fires once
// per badge (persisted in earnedBadgeIds). Badges themselves stay visible
// year-round on the Rewards grid; this just makes the actual unlock moment
// noticeable instead of something only discovered by visiting there later.
export default function BadgeCelebrationModal({ badge, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();

  useEffect(() => {
    if (badge) hapticSuccess();
  }, [badge?.id]);

  return (
    <Modal visible={!!badge} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{t("rewards.badgeCelebration.eyebrow")}</Text>
          {badge ? (
            <View style={styles.iconWrap}>
              <AppIcon set={badge.icon.set} name={badge.icon.name} solid={badge.icon.solid} size={44} color={colors.goldText} />
            </View>
          ) : null}
          <Text style={styles.badgeName}>{badge?.name}</Text>
          <Text style={styles.badgeDesc}>{badge?.desc}</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
          >
            <Text style={styles.closeBtnText}>{t("rewards.badgeCelebration.dismiss")}</Text>
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
      padding: 20,
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
    eyebrow: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: colors.sageDark,
      marginBottom: 14,
    },
    iconWrap: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.momentCard,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    badgeName: { fontSize: 19, fontWeight: "800", color: colors.sageDark, textAlign: "center", marginBottom: 6 },
    badgeDesc: { fontSize: 13, color: colors.textSoft, textAlign: "center", marginBottom: 22 },
    closeBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 28,
    },
    closeBtnText: { color: colors.buttonOnText, fontSize: 14, fontWeight: "700" },
  });
}
