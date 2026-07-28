import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme";

// f.type is "verse", "wisdom" (quotes), or "truestory". Older favorites saved
// before the content split could be a "wisdom" entry with a title (from when
// WISDOM mixed in short fictional vignettes) — keep labeling those as
// "Story" so previously-saved favorites don't look wrong.
function favoriteKindLabel(f) {
  if (f.type === "verse") return "Verse";
  if (f.type === "truestory") return "True Story";
  if (f.type === "wisdom" && f.title) return "Story";
  return "Quote";
}

function favoriteSourceLine(f) {
  if (f.type === "verse") return f.ref;
  if (f.type === "truestory") return f.title;
  if (f.type === "wisdom" && f.title) return f.title;
  return `— ${f.source || ""}`;
}

export default function FavoritesScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const [query, setQuery] = useState("");
  const allFavorites = store.favorites.slice().sort((a, b) => b.dayNumber - a.dayNumber);

  const q = query.trim().toLowerCase();
  const favorites = q
    ? allFavorites.filter((f) => {
        const sourceLine = favoriteSourceLine(f);
        return (
          (f.text && f.text.toLowerCase().includes(q)) || (sourceLine && sourceLine.toLowerCase().includes(q))
        );
      })
    : allFavorites;

  return (
    <View>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>Verses and quotes you've saved to come back to.</Text>

      {allFavorites.length === 0 ? null : (
        <TextInput
          style={styles.searchInput}
          placeholder="Search your favorites..."
          placeholderTextColor={colors.textSoft}
          value={query}
          onChangeText={setQuery}
        />
      )}

      {allFavorites.length === 0 ? (
        <Text style={styles.empty}>
          Nothing saved yet — tap "Save" on a verse or quote you want to keep.
        </Text>
      ) : favorites.length === 0 ? (
        <Text style={styles.empty}>No favorites match your search.</Text>
      ) : (
        favorites.map((f) => {
          const kindLabel = favoriteKindLabel(f);
          const sourceLine = favoriteSourceLine(f);
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
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.input,
      marginBottom: 16,
    },
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
