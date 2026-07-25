import { StyleSheet, View } from "react-native";
import { colors, shadow } from "../theme";

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    ...shadow,
  },
});
