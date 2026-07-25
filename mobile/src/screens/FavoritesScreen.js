import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

export default function FavoritesScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const favorites = store.favorites.slice().sort((a, b) => b.dayNumber - a.dayNumber);

  return (
    <View>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>Verses and quotes you've saved to come back to.</Text>

      {favorites.length === 0 ? (
        <Text style={styles.empty}>
          Nothing saved yet — tap "Save" on a verse or quote you want to keep.
        </Text>
      ) : (
        favorites.map((f) => {
          const kindLabel = f.type === "verse" ? "Verse" : f.title ? "Story" : "Quote";
          const sourceLine = f.type === "verse" ? f.ref : f.title ? f.title : `— ${f.source || ""}`;
          return (
            <View key={f.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryKind}>{kindLabel} · Day {f.dayNumber}</Text>
                <TouchableOpacity onPress={() => store.removeFavorite(f.id)}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.entryText}>“{f.text}”</Text>
              <Text style={styles.entrySource}>{sourceLine}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 18 },
    empty: { fontSize: 14, color: colors.textSoft, textAlign: "center", paddingVertical: 30 },
    entryCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...shadow,
    },
    entryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    entryKind: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontWeight: "700",
      color: colors.sageDark,
    },
    remove: { color: colors.textSoft, fontSize: 14, paddingHorizontal: 4 },
    entryText: {
      fontSize: 16,
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    entrySource: { fontSize: 12, color: colors.textSoft },
  });
}
