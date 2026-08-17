import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

export default function ChatScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t, i18n } = useTranslation();
  const { chatAccess, recordChatMessageSent, settings } = store;
  const crisisResource = getCrisisResource(resolveCrisisRegion(settings));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    hapticTap();
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    setErrorMsg("");
    try {
      const reply = await sendChatMessage(text, history, i18n.language, resolveCrisisRegion(settings));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      recordChatMessageSent();
    } catch (e) {
      setErrorMsg(e.message || t("chat.genericError"));
    } finally {
      setSending(false);
    }
  };

  // Subscriptions aren't wired up yet — this app has no App Store/Play
  // Console product or RevenueCat project behind it. Once that exists,
  // replace this with the real purchase flow and call
  // store.updateSettings({ chatSubscribed: true }) on success.
  const handleSubscribe = () => {
    Alert.alert(t("chat.subscribeComingSoonTitle"), t("chat.subscribeComingSoonMessage"));
  };

  return (
    <View>
      <Text style={styles.title}>{t("chat.title")}</Text>
      <Text style={styles.subtitle}>{t("chat.subtitle")}</Text>

      {!chatAccess.granted ? (
        <ChatPaywall styles={styles} onSubscribe={handleSubscribe} />
      ) : (
        <>
          {!chatAccess.unlimited ? (
            <Text style={styles.quotaBanner}>
              {t("chat.quotaBanner", { left: chatAccess.messagesLeft, limit: chatAccess.limit })}
            </Text>
          ) : (
            <Text style={styles.quotaBanner}>{t("chat.unlimitedBanner")}</Text>
          )}

          <View style={styles.messagesWrap}>
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
          </View>

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
    </View>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    title: { fontSize: 22, fontWeight: "700", color: colors.sageDark, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSoft, marginBottom: 18, lineHeight: 20 },
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
    messagesWrap: { marginBottom: 12, minHeight: 80 },
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
    errorText: { fontSize: 13, color: colors.goldText, marginBottom: 10 },
    inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
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
    disclaimer: { fontSize: 11, color: colors.textSoft, lineHeight: 16, marginBottom: 8 },
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
  });
}
