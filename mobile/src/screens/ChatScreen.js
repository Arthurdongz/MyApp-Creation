import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { sendChatMessage } from "../chat";
import { getCrisisResource, resolveCrisisRegion } from "../crisisResources";
import { hapticTap } from "../haptics";

function ChatPaywall({ styles, onSubscribe }) {
  const { t } = useTranslation();
  return (
    <View style={styles.paywallCard}>
      <Text style={styles.paywallTitle}>{t("chat.paywall.title")}</Text>
      <Text style={styles.paywallText}>{t("chat.paywall.text")}</Text>
      <TouchableOpacity
        style={styles.subscribeBtn}
        onPress={onSubscribe}
        accessibilityRole="button"
        accessibilityLabel={t("chat.paywall.subscribeLabel")}
      >
        <Text style={styles.subscribeBtnText}>{t("chat.paywall.subscribeButton")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatConversationTimestamp(ts) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatScreen({ store, onClose }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t, i18n } = useTranslation();
  const {
    chatAccess,
    recordChatMessageSent,
    settings,
    chatConversations,
    openChatConversation,
    appendChatMessage,
    resumeChatConversation,
  } = store;
  const crisisResource = getCrisisResource(resolveCrisisRegion(settings));
  const [view, setView] = useState("chat");
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const scrollRef = useRef(null);

  // Resolved once per screen open (this component mounts fresh each time
  // the chat modal opens — see App.js) so the 30-minute-idle / app-was-
  // closed check in openChatConversation runs on every open, not just the
  // first ever one.
  useEffect(() => {
    setConversation(openChatConversation());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storedConversation = conversation
    ? chatConversations.find((c) => c.id === conversation.id)
    : null;
  const messages = storedConversation ? storedConversation.messages : [];

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !conversation) return;
    hapticTap();
    const history = messages;
    appendChatMessage(conversation, { role: "user", content: text });
    setInput("");
    setSending(true);
    setErrorMsg("");
    try {
      const reply = await sendChatMessage(text, history, i18n.language, resolveCrisisRegion(settings));
      appendChatMessage(conversation, { role: "assistant", content: reply });
      recordChatMessageSent();
    } catch (e) {
      setErrorMsg(e.message || t("chat.genericError"));
    } finally {
      setSending(false);
    }
  };

  const handleOpenHistoryRow = (conv) => {
    hapticTap();
    resumeChatConversation(conv.id);
    setConversation(conv);
    setView("chat");
  };

  // Subscriptions aren't wired up yet — this app has no App Store/Play
  // Console product or RevenueCat project behind it. Once that exists,
  // replace this with the real purchase flow and call
  // store.updateSettings({ chatSubscribed: true }) on success.
  const handleSubscribe = () => {
    Alert.alert(t("chat.subscribeComingSoonTitle"), t("chat.subscribeComingSoonMessage"));
  };

  const sortedHistory = [...chatConversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      {/*
        Android's Modal renders in its own native window, which doesn't
        resize with the keyboard the way a normal screen does — so this
        can't rely on native window resizing and needs behavior="height"
        (not the default no-op of leaving behavior unset) to actually push
        the input above the keyboard there. iOS uses "padding" as usual.
      */}
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {view === "history" ? (
              <TouchableOpacity
                onPress={() => setView("chat")}
                style={styles.iconBtn}
                accessibilityLabel={t("chat.backToChatLabel")}
                accessibilityRole="button"
              >
                <Text style={styles.iconBtnText}>‹</Text>
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerTextWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {view === "history" ? t("chat.historyTitle") : t("chat.title")}
              </Text>
              {view === "chat" ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {t("chat.subtitle")}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            {view === "chat" ? (
              <TouchableOpacity
                onPress={() => {
                  hapticTap();
                  setView("history");
                }}
                style={styles.iconBtn}
                accessibilityLabel={t("chat.historyLabel")}
                accessibilityRole="button"
              >
                <Text style={styles.iconBtnText}>🕘</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconBtn}
              accessibilityLabel={t("app.closeChat")}
              accessibilityRole="button"
            >
              <Text style={styles.iconBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {view === "history" ? (
          <ScrollView style={styles.flexFill} contentContainerStyle={styles.historyContent}>
            {sortedHistory.length === 0 ? (
              <Text style={styles.emptyState}>{t("chat.historyEmpty")}</Text>
            ) : (
              sortedHistory.map((conv) => {
                const preview =
                  conv.messages.find((m) => m.role === "user")?.content || t("chat.historyPreviewFallback");
                return (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.historyRow}
                    onPress={() => handleOpenHistoryRow(conv)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.historyPreview} numberOfLines={1}>
                      {preview}
                    </Text>
                    <Text style={styles.historyMeta}>
                      {t("chat.historyRowMeta", {
                        count: conv.messages.length,
                        date: formatConversationTimestamp(conv.updatedAt),
                      })}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        ) : !chatAccess.granted ? (
          <ScrollView style={styles.flexFill} contentContainerStyle={styles.bodyContent}>
            <ChatPaywall styles={styles} onSubscribe={handleSubscribe} />
          </ScrollView>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.flexFill}
              contentContainerStyle={styles.bodyContent}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {!chatAccess.unlimited ? (
                <Text style={styles.quotaBanner}>
                  {t("chat.quotaBanner", { left: chatAccess.messagesLeft, limit: chatAccess.limit })}
                </Text>
              ) : (
                <Text style={styles.quotaBanner}>{t("chat.unlimitedBanner")}</Text>
              )}

              {messages.length === 0 ? (
                <Text style={styles.emptyState}>{t("chat.emptyState")}</Text>
              ) : (
                messages.map((m, i) => (
                  <View
                    key={i}
                    style={[styles.bubble, m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant]}
                  >
                    <Text style={[styles.bubbleText, m.role === "user" && styles.bubbleTextUser]}>
                      {m.content}
                    </Text>
                  </View>
                ))
              )}
              {sending ? <ActivityIndicator color={colors.sageDark} style={styles.spinner} /> : null}
            </ScrollView>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={t("chat.inputPlaceholder")}
                placeholderTextColor={colors.textSoft}
                multiline
                editable={!sending}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!input.trim() || sending}
                accessibilityRole="button"
                accessibilityLabel={t("chat.sendLabel")}
              >
                <Text style={styles.sendBtnText}>{t("chat.sendButton")}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>{t("chat.disclaimer", { resource: crisisResource.sentence })}</Text>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.chatBg },
    flexFill: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.chatHeaderBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8, gap: 8 },
    headerTextWrap: { flex: 1 },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { fontSize: 17, fontWeight: "700", color: colors.sageDark },
    subtitle: { fontSize: 11, color: colors.textSoft, lineHeight: 14, marginTop: 1 },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBtnText: { fontSize: 15, color: colors.sageDark },
    bodyContent: { padding: 16, paddingBottom: 24, flexGrow: 1 },
    quotaBanner: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.goldText,
      backgroundColor: colors.factCard,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 12,
      alignSelf: "flex-start",
      marginBottom: 14,
    },
    emptyState: { fontSize: 14, color: colors.textSoft, fontStyle: "italic" },
    spinner: { marginTop: 8 },
    bubble: {
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 10,
      maxWidth: "85%",
    },
    bubbleUser: {
      backgroundColor: colors.buttonBg,
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
      ...shadow,
    },
    bubbleText: { fontSize: 14, lineHeight: 20, color: colors.text },
    bubbleTextUser: { color: colors.buttonOnText },
    errorText: { fontSize: 13, color: colors.goldText, marginHorizontal: 16, marginBottom: 6 },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 10,
      backgroundColor: colors.chatHeaderBg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      maxHeight: 100,
    },
    sendBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 16,
    },
    sendBtnDisabled: { opacity: 0.4 },
    sendBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
    disclaimer: {
      fontSize: 11,
      color: colors.textSoft,
      lineHeight: 16,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.chatHeaderBg,
    },
    paywallCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 18,
      alignItems: "flex-start",
      ...shadow,
    },
    paywallTitle: { fontSize: 16, fontWeight: "700", color: colors.sageDark, marginBottom: 10 },
    paywallText: { fontSize: 14, lineHeight: 20, color: colors.text, marginBottom: 16 },
    subscribeBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 13,
      paddingHorizontal: 20,
    },
    subscribeBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
    historyContent: { padding: 16, paddingBottom: 24, flexGrow: 1 },
    historyRow: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    historyPreview: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 4 },
    historyMeta: { fontSize: 12, color: colors.textSoft },
  });
}
