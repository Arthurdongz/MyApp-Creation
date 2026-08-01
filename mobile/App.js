import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "./src/theme";
import { useJournalStore } from "./src/storage";
import { initCrashReporting, Sentry } from "./src/crashReporting";
import "./src/i18n";
import TodayScreen from "./src/screens/TodayScreen";
import StoryScreen from "./src/screens/StoryScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AboutScreen from "./src/screens/AboutScreen";
import MenuModal from "./src/components/MenuModal";

initCrashReporting();

const TAB_KEYS = [
  { key: "today", i18nKey: "app.tabs.today" },
  { key: "story", i18nKey: "app.tabs.story" },
  { key: "history", i18nKey: "app.tabs.journal" },
  { key: "favorites", i18nKey: "app.tabs.favorites" },
  { key: "rewards", i18nKey: "app.tabs.rewards" },
];

function App() {
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

export default Sentry.wrap(App);

function AppContent({ store }) {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
            <Text style={styles.loadingText}>{t("app.loading")}</Text>
          </View>
        ) : showSettings ? (
          <SettingsScreen store={store} onClose={() => setShowSettings(false)} />
        ) : showAbout ? (
          <AboutScreen onClose={() => setShowAbout(false)} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Text style={styles.brandMark}>✦</Text>
                <View>
                  <Text style={styles.title}>{t("app.brand")}</Text>
                  <Text style={styles.tagline}>{t("app.tagline")}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.themeToggle}
                  onPress={() => setShowMenu(true)}
                  accessibilityLabel={t("app.menu")}
                >
                  <Text style={styles.themeToggleText}>☰</Text>
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
              {TAB_KEYS.map((tabDef) => (
                <TouchableOpacity
                  key={tabDef.key}
                  style={[styles.tabBtn, tab === tabDef.key && styles.tabBtnActive]}
                  onPress={() => setTab(tabDef.key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === tabDef.key }}
                >
                  <Text style={[styles.tabLabel, tab === tabDef.key && styles.tabLabelActive]}>
                    {t(tabDef.i18nKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === "today" && <TodayScreen store={store} />}
            {tab === "story" && <StoryScreen store={store} />}
            {tab === "history" && <HistoryScreen store={store} />}
            {tab === "favorites" && <FavoritesScreen store={store} />}
            {tab === "rewards" && <RewardsScreen store={store} />}

            <Text style={styles.footer}>{t("app.footer")}</Text>
          </ScrollView>
        )}
        <MenuModal
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          onSettings={() => setShowSettings(true)}
          onAbout={() => setShowAbout(true)}
        />
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
    tabBtnActive: { backgroundColor: colors.buttonBg },
    tabLabel: { fontSize: 12, fontWeight: "600", color: colors.textSoft },
    tabLabelActive: { color: colors.buttonOnText },
    footer: {
      textAlign: "center",
      marginTop: 20,
      color: colors.textSoft,
      fontSize: 13,
      fontStyle: "italic",
    },
  });
}
