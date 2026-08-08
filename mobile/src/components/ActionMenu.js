import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

// A single "···" control that opens a small dropdown of actions, replacing
// what used to be 2-3 separate button pills per content block (Listen /
// Share / Save) — same actions, less visual noise per block.
export default function ActionMenu({ actions }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const [open, setOpen] = useState(false);

  const handlePress = (action) => {
    setOpen(false);
    hapticTap();
    action.onPress();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="More actions"
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>•••</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menuWrap}>
            <Pressable style={styles.menu}>
              {actions.map((action, i) => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.menuItem, i > 0 && styles.menuItemDivider]}
                  onPress={() => handlePress(action)}
                >
                  <Text style={[styles.menuItemText, action.active && styles.menuItemTextActive]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    trigger: {
      width: 30,
      height: 26,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
    },
    triggerText: { fontSize: 13, fontWeight: "700", color: colors.textSoft, letterSpacing: 1 },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.15)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      padding: 20,
      paddingTop: 90,
    },
    menuWrap: { minWidth: 160 },
    menu: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: "hidden",
      ...shadow,
    },
    menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
    menuItemDivider: { borderTopWidth: 1, borderTopColor: colors.border },
    menuItemText: { fontSize: 14, fontWeight: "600", color: colors.text },
    menuItemTextActive: { color: colors.goldText },
  });
}
