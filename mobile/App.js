import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/theme";
import { useJournalStore } from "./src/storage";
import TodayScreen from "./src/screens/TodayScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

const TABS = [
  { key: "today", label: "Today" },
  { key: "history", label: "Journal" },
  { key: "favorites", label: "Favorites" },
  { key: "rewards", label: "Rewards" },
];

export default function App() {
  const store = useJournalStore();
  const systemScheme = useColorScheme();

  const themeSetting = store.settings?.theme || "system";
  const mode = themeSetting === "system" ? systemScheme || "light" : themeSetting;
  const toggleTheme = () => {
    const current = themeSetting === "system" ? systemScheme || "light" : themeSetting;
    store.updateSettings({ theme: current === "dark" ? "light" : "dark" });
  };

  return (
    <ThemeProvider mode={mode} toggleTheme={toggleTheme}>
      <AppContent store={store} />
    </ThemeProvider>
  );
}

function AppContent({ store }) {
  const { colors, mode, toggleTheme } = useTheme();
  const [tab, setTab] = useState("today");
  const styles = getStyles(colors);

  if (store.ready && !store.settings.onboarded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <OnboardingScreen onStart={store.completeOnboarding} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} />
        {!store.ready ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Text style={styles.brandMark}>✦</Text>
                <View>
                  <Text style={styles.title}>Barnabas Journal</Text>
                  <Text style={styles.tagline}>"Son of Encouragement" — Acts 4:36</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
                  <Text style={styles.themeToggleText}>{mode === "dark" ? "☀️" : "🌙"}</Text>
                </TouchableOpacity>
                <View style={styles.stat}>
                  <Text style={styles.statText}>⭐ {store.totalStars}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statText}>🔥 {store.streak}</Text>
                </View>
              </View>
            </View>

            <View style={styles.tabs}>
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === "today" && <TodayScreen store={store} />}
            {tab === "history" && <HistoryScreen store={store} />}
            {tab === "favorites" && <FavoritesScreen store={store} />}
            {tab === "rewards" && <RewardsScreen store={store} />}

            <Text style={styles.footer}>Be still. Be kind. Be someone's encouragement today.</Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { color: colors.textSoft },
    scrollContent: { padding: 18, paddingBottom: 40 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
      flexWrap: "wrap",
      gap: 10,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    brandMark: { fontSize: 26, color: colors.gold },
    title: { fontSize: 20, fontWeight: "700", color: colors.sageDark },
    tagline: { fontSize: 12, color: colors.textSoft, fontStyle: "italic", marginTop: 2 },
    statsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    themeToggle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    themeToggleText: { fontSize: 14 },
    stat: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    statText: { fontWeight: "700", fontSize: 13, color: colors.text },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 5,
      marginBottom: 20,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.sage },
    tabLabel: { fontSize: 12, fontWeight: "600", color: colors.textSoft },
    tabLabelActive: { color: "#fff" },
    footer: {
      textAlign: "center",
      marginTop: 20,
      color: colors.textSoft,
      fontSize: 13,
      fontStyle: "italic",
    },
  });
}
