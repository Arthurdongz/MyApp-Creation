import { Modal, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

const APP_SHARE_URL = "https://arthurdongz.github.io/MyApp-Creation/";

async function shareApp(t) {
  try {
    await Share.share({
      message: `${t("menu.shareAppMessage", { brand: t("app.brand") })}\n${APP_SHARE_URL}`,
    });
  } catch (e) {
    // user dismissed the share sheet — nothing to do
  }
}

export default function MenuModal({ visible, onClose, onSettings, onAbout }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();

  const handle = (fn) => {
    hapticTap();
    onClose();
    if (fn) fn();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("app.menu")}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel={t("menu.closeLabel")}
              accessibilityRole="button"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.item} onPress={() => handle(onSettings)} accessibilityRole="button">
            <Text style={styles.itemIcon}>⚙️</Text>
            <Text style={styles.itemLabel}>{t("settings.title")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => handle(() => shareApp(t))}
            accessibilityRole="button"
          >
            <Text style={styles.itemIcon}>↗</Text>
            <Text style={styles.itemLabel}>{t("menu.shareApp")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => handle(onAbout)} accessibilityRole="button">
            <Text style={styles.itemIcon}>ℹ️</Text>
            <Text style={styles.itemLabel}>{t("menu.about")}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
      maxWidth: 340,
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.sageDark },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, color: colors.textSoft },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    itemIcon: { fontSize: 18 },
    itemLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  });
}
