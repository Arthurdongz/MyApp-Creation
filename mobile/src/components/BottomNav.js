import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

// The bar's own content height, not counting the safe-area bottom inset
// this component adds as padding — other absolutely-positioned elements
// (the chat FAB) need this to sit above the bar rather than under it.
export const BOTTOM_NAV_BASE_HEIGHT = 58;

// Icon-only tab bar, replacing the old horizontally-scrolling top tab
// strip — six tabs is one too many for icon+label to stay uncluttered, so
// only the active tab gets a label underneath; the rest lean on the icon
// alone plus an accessibility label for anyone using a screen reader.
export default function BottomNav({ tabs, activeKey, onSelect }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  const { t } = useTranslation();

  return (
    <View style={styles.bar}>
      {tabs.map((tabDef) => {
        const active = activeKey === tabDef.key;
        return (
          <TouchableOpacity
            key={tabDef.key}
            style={styles.btn}
            onPress={() => {
              hapticTap();
              onSelect(tabDef.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(tabDef.i18nKey)}
          >
            <Ionicons
              name={active ? tabDef.iconActive : tabDef.icon}
              size={22}
              color={active ? colors.sageDark : colors.textSoft}
            />
            {active ? <Text style={styles.label}>{t(tabDef.i18nKey)}</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getStyles(colors, insets) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: BOTTOM_NAV_BASE_HEIGHT + insets.bottom,
      paddingBottom: insets.bottom,
    },
    btn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    label: { fontSize: 10, fontWeight: "700", color: colors.sageDark },
  });
}
