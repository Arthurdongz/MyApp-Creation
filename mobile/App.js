import { useEffect, useRef, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import { ThemeProvider, useTheme } from "./src/theme";
import { useJournalStore } from "./src/storage";
import { initCrashReporting, Sentry } from "./src/crashReporting";
import { checkForUpdateAndApply } from "./src/updates";
import { pickForDay, pickVerseVersion } from "./src/content";
import { BIBLE_VERSIONS, VERSES } from "./src/data/verses";
import "./src/i18n";
import TodayScreen from "./src/screens/TodayScreen";
import StoryScreen from "./src/screens/StoryScreen";
import FactScreen from "./src/screens/FactScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import ChatScreen from "./src/screens/ChatScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AboutScreen from "./src/screens/AboutScreen";
import MenuModal from "./src/components/MenuModal";
import OnboardingTour from "./src/components/OnboardingTour";

const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);
// expo-notifications' response-listener APIs aren't implemented on web and
// throw there — matches the same guard notifications.js uses before calling
// into this module for anything.
const NOTIFICATIONS_SUPPORTED = Platform.OS === "ios" || Platform.OS === "android";

// Fired by the "Share Verse" Android app shortcut (long-press the launcher
// icon) via the plugins/withShareShortcut.js config plugin, which routes it
// to this barnabas-journal://share-today deep link. Skips in-app navigation
// entirely — the share sheet opens straight from the shortcut tap.
const SHARE_SHORTCUT_URL_MARKER = "share-today";

async function shareTodaysVerse(store) {
  const entry = pickForDay(VERSES, store.latestDay, store.order);
  const version = pickVerseVersion(store.latestDay, store.settings, VERSE_VERSION_IDS);
  const text = entry.versions[version] || entry.versions.KJV;
  const message = `“${text}” — ${entry.ref} (${version})\n\n— sent from Barnabas Journal`;
  try {
    await Share.share({ message });
  } catch (e) {
    // user dismissed the share sheet — nothing to do
  }
}

initCrashReporting();
checkForUpdateAndApply();

const TAB_KEYS = [
  { key: "today", i18nKey: "app.tabs.today" },
  { key: "story", i18nKey: "app.tabs.story" },
  { key: "facts", i18nKey: "app.tabs.facts" },
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
  const { colors, mode, shadow } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const styles = getStyles(colors, shadow);

  const shortcutHandledRef = useRef(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!store.ready || shortcutHandledRef.current) return;
    Linking.getInitialURL().then((url) => {
      if (url && url.includes(SHARE_SHORTCUT_URL_MARKER) && !shortcutHandledRef.current) {
        shortcutHandledRef.current = true;
        shareTodaysVerse(store);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ready]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url && event.url.includes(SHARE_SHORTCUT_URL_MARKER)) {
        shareTodaysVerse(store);
      }
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.latestDay, store.order, store.settings]);

  // Tapping the morning verse or highlight (fact) notification should land
  // on the exact day it was about, not just wherever "today" is now — see
  // the dayNumber in each notification's data, set in notifications.js.
  const notificationHandledRef = useRef(false);

  const handleNotificationResponse = (response) => {
    const data = response?.notification?.request?.content?.data;
    if (!data || data.screen !== "today" || !Number.isFinite(data.dayNumber)) return;
    setTab("today");
    store.jumpToDay(data.dayNumber);
  };

  useEffect(() => {
    if (!NOTIFICATIONS_SUPPORTED || !store.ready || notificationHandledRef.current) return;
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response && !notificationHandledRef.current) {
        notificationHandledRef.current = true;
        handleNotificationResponse(response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.ready]);

  useEffect(() => {
    if (!NOTIFICATIONS_SUPPORTED) return;
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.latestDay]);

  if (store.ready && !store.settings.onboarded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <OnboardingScreen
            onStart={store.completeOnboarding}
            settings={store.settings}
            updateSettings={store.updateSettings}
          />
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
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
              contentContainerStyle={styles.tabs}
            >
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
            </ScrollView>

            {tab === "today" && <TodayScreen store={store} scrollViewRef={scrollViewRef} />}
            {tab === "story" && <StoryScreen store={store} />}
            {tab === "facts" && <FactScreen store={store} />}
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
        <OnboardingTour
          visible={store.ready && store.settings.onboarded && !store.settings.tourShown && !showSettings && !showAbout}
          onFinish={() => store.updateSettings({ tourShown: true })}
        />

        {store.ready && store.settings.onboarded && !showSettings && !showAbout && !showChat ? (
          <TouchableOpacity
            style={styles.chatFab}
            onPress={() => setShowChat(true)}
            accessibilityRole="button"
            accessibilityLabel={t("app.chatFab")}
          >
            <Text style={styles.chatFabIcon}>💬</Text>
          </TouchableOpacity>
        ) : null}

        <Modal visible={showChat} animationType="slide" onRequestClose={() => setShowChat(false)}>
          {showChat ? <ChatScreen store={store} onClose={() => setShowChat(false)} /> : null}
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function getStyles(colors, shadow) {
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
    tabsScroll: { marginBottom: 20 },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 5,
      gap: 4,
    },
    tabBtn: {
      minWidth: 74,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
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
    chatFab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.buttonBg,
      alignItems: "center",
      justifyContent: "center",
      ...shadow,
    },
    chatFabIcon: { fontSize: 24 },
  });
}
