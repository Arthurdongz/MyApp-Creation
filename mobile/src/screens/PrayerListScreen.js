// A simple prayer log: what someone's praying for now, and a record of how
// it was answered once it is — the point isn't task-tracking (answered
// prayer deliberately earns no stars/streak credit, unlike the rest of the
// app's daily content) but building a personal record of God's
// faithfulness the user can look back through over time.
import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

function formatDate(ts, locale) {
  return new Date(ts).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function answeredAfterLabel(t, createdAt, answeredAt) {
  const days = Math.round((answeredAt - createdAt) / 86400000);
  if (days <= 0) return t("prayerList.answeredSameDay");
  return t("prayerList.answeredAfter", { count: days });
}

export default function PrayerListScreen({ store, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("active");
  const [draft, setDraft] = useState("");
  const [answeringId, setAnsweringId] = useState(null);
  const [answerDraft, setAnswerDraft] = useState("");

  const prayers = store.prayers;
  const activePrayers = prayers.filter((p) => p.status === "active").sort((a, b) => b.createdAt - a.createdAt);
  const answeredPrayers = prayers
    .filter((p) => p.status === "answered")
    .sort((a, b) => b.answeredAt - a.answeredAt);
  const total = prayers.length;

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    hapticTap();
    store.addPrayer(text);
    setDraft("");
  };

  const startAnswering = (id) => {
    hapticTap();
    setAnsweringId(id);
    setAnswerDraft("");
  };

  const cancelAnswering = () => {
    hapticTap();
    setAnsweringId(null);
    setAnswerDraft("");
  };

  const confirmAnswered = (id) => {
    hapticTap();
    store.markPrayerAnswered(id, answerDraft);
    setAnsweringId(null);
    setAnswerDraft("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>{t("prayerList.title")}</Text>
          <Text style={styles.subtitle}>{t("prayerList.subtitle")}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {total > 0 ? (
        <Text style={styles.stat}>
          {t("prayerList.stat", { answered: answeredPrayers.length, total })}
        </Text>
      ) : null}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "active" && styles.tabBtnActive]}
          onPress={() => {
            hapticTap();
            setTab("active");
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === "active" }}
        >
          <Text style={[styles.tabLabel, tab === "active" && styles.tabLabelActive]}>
            {t("prayerList.tabActive")} ({activePrayers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "answered" && styles.tabBtnActive]}
          onPress={() => {
            hapticTap();
            setTab("answered");
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === "answered" }}
        >
          <Text style={[styles.tabLabel, tab === "answered" && styles.tabLabelActive]}>
            {t("prayerList.tabAnswered")} ({answeredPrayers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "active" ? (
        <View style={styles.composerRow}>
          <TextInput
            style={styles.composerInput}
            value={draft}
            onChangeText={setDraft}
            placeholder={t("prayerList.addPlaceholder")}
            placeholderTextColor={colors.textSoft}
            multiline
            accessibilityLabel={t("prayerList.addLabel")}
          />
          <TouchableOpacity
            style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!draft.trim()}
            accessibilityRole="button"
          >
            <Text style={styles.addBtnText}>{t("prayerList.addButton")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {tab === "active" ? (
        activePrayers.length === 0 ? (
          <Text style={styles.emptyState}>{t("prayerList.emptyActive")}</Text>
        ) : (
          <FlatList
            data={activePrayers}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardMeta}>{t("prayerList.dayLabel", { day: item.dayNumber })}</Text>
                  <TouchableOpacity
                    onPress={() => store.deletePrayer(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t("prayerList.deleteLabel")}
                  >
                    <Text style={styles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardText}>{item.text}</Text>

                {answeringId === item.id ? (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerPrompt}>{t("prayerList.answerPrompt")}</Text>
                    <TextInput
                      style={styles.answerInput}
                      value={answerDraft}
                      onChangeText={setAnswerDraft}
                      placeholder={t("prayerList.answerPlaceholder")}
                      placeholderTextColor={colors.textSoft}
                      multiline
                    />
                    <View style={styles.answerActions}>
                      <TouchableOpacity onPress={cancelAnswering} accessibilityRole="button">
                        <Text style={styles.cancelLink}>{t("prayerList.cancelButton")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => confirmAnswered(item.id)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.confirmBtnText}>{t("prayerList.confirmButton")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.markAnsweredBtn}
                    onPress={() => startAnswering(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t("prayerList.markAnsweredLabel")}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.sageDark} />
                    <Text style={styles.markAnsweredText}>{t("prayerList.markAnsweredButton")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )
      ) : answeredPrayers.length === 0 ? (
        <Text style={styles.emptyState}>{t("prayerList.emptyAnswered")}</Text>
      ) : (
        <FlatList
          data={answeredPrayers}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMeta}>
                  {formatDate(item.answeredAt, i18n.language)} · {answeredAfterLabel(t, item.createdAt, item.answeredAt)}
                </Text>
                <TouchableOpacity
                  onPress={() => store.deletePrayer(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t("prayerList.deleteLabel")}
                >
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardText}>{item.text}</Text>
              {item.answerNote ? <Text style={styles.answerNoteText}>“{item.answerNote}”</Text> : null}
              <TouchableOpacity
                onPress={() => store.reopenPrayer(item.id)}
                accessibilityRole="button"
                accessibilityLabel={t("prayerList.reopenLabel")}
              >
                <Text style={styles.reopenLink}>{t("prayerList.reopenButton")}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    container: { flex: 1, padding: 18 },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    headerTextWrap: { flex: 1, marginRight: 12 },
    title: { fontSize: 20, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.textSoft, lineHeight: 18 },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 14, color: colors.textSoft },
    stat: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.goldText,
      backgroundColor: colors.factCard,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 14 },
    tabBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    tabBtnActive: { backgroundColor: colors.sageDark, borderColor: colors.sageDark },
    tabLabel: { fontSize: 13, fontWeight: "700", color: colors.text },
    tabLabelActive: { color: "#fff" },
    composerRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 16 },
    composerInput: {
      flex: 1,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      maxHeight: 90,
    },
    addBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 16,
    },
    addBtnDisabled: { opacity: 0.4 },
    addBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
    emptyState: {
      fontSize: 14,
      color: colors.textSoft,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: 20,
    },
    list: { paddingBottom: 40 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      ...shadow,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
    cardMeta: { fontSize: 11, color: colors.textSoft, fontWeight: "600" },
    remove: { color: colors.textSoft, fontSize: 14, paddingHorizontal: 4 },
    cardText: { fontSize: 15, lineHeight: 21, color: colors.text },
    answerNoteText: { fontSize: 13, lineHeight: 19, color: colors.textSoft, fontStyle: "italic", marginTop: 8 },
    markAnsweredBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, alignSelf: "flex-start" },
    markAnsweredText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    reopenLink: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSoft,
      textDecorationLine: "underline",
      marginTop: 10,
      alignSelf: "flex-start",
    },
    answerBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
    answerPrompt: { fontSize: 12, fontWeight: "700", color: colors.text, marginBottom: 6 },
    answerInput: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 13,
      color: colors.text,
      minHeight: 50,
      textAlignVertical: "top",
    },
    answerActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 8 },
    cancelLink: { fontSize: 13, color: colors.textSoft, fontWeight: "600" },
    confirmBtn: { backgroundColor: colors.buttonBg, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
    confirmBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 13 },
  });
}
