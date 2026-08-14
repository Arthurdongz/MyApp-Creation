import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import ShareQuoteCard from "./ShareQuoteCard";
import { useTheme } from "../theme";
import { SHARE_THEMES } from "../shareThemes";
import { hapticTap } from "../haptics";

// Shown when the user taps Share on a verse, quote, or story — lets them
// preview the actual card with different background colors before sending
// it, rather than picking a color ahead of time in Settings.
export default function SharePreviewModal({ visible, mainText, sourceLine, initialThemeId, onThemeChange, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const [selectedId, setSelectedId] = useState(initialThemeId || "classic");
  const [shareMsg, setShareMsg] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setSelectedId(initialThemeId || "classic");
      setShareMsg("");
    }
  }, [visible, initialThemeId]);

  const selectedTheme = SHARE_THEMES.find((t) => t.id === selectedId) || SHARE_THEMES[0];

  const handleSelect = (theme) => {
    hapticTap();
    setSelectedId(theme.id);
    if (onThemeChange) onThemeChange(theme.id);
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share from Barnabas Journal" });
      }
      setShareMsg("Shared. Thank you for passing it on!");
    } catch (e) {
      setShareMsg("Couldn't create the share image right now.");
    }
    setTimeout(onClose, 900);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Background</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close" accessibilityRole="button">
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewWrap}>
            <ShareQuoteCard ref={cardRef} text={mainText} sourceLine={sourceLine} colors={selectedTheme.colors} />
          </View>

          <View style={styles.swatchRow}>
            {SHARE_THEMES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleSelect(t)}
                style={[styles.swatchWrap, selectedId === t.id && styles.swatchWrapSelected]}
                accessibilityLabel={`${t.name} background${selectedId === t.id ? ", selected" : ""}`}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={t.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.swatch}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share this</Text>
          </TouchableOpacity>
          {shareMsg ? <Text style={styles.shareMsg}>{shareMsg}</Text> : null}
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
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.sageDark },
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
    previewWrap: {
      alignItems: "center",
      marginBottom: 16,
    },
    swatchRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
      marginBottom: 16,
    },
    swatchWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: "transparent",
    },
    swatchWrapSelected: { borderColor: colors.sageDark },
    swatch: { flex: 1, borderRadius: 17 },
    shareBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
    },
    shareBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
    shareMsg: {
      marginTop: 10,
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      textAlign: "center",
    },
  });
}
