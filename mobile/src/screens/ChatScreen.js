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
import { useTheme } from "../theme";
import { sendChatMessage } from "../chat";
import { getCrisisResource, getDeviceRegionCode } from "../crisisResources";
import { hapticTap } from "../haptics";

const crisisResource = getCrisisResource(getDeviceRegionCode());

function ChatPaywall({ styles, onSubscribe }) {
  return (
    <View style={styles.paywallCard}>
      <Text style={styles.paywallTitle}>You've used this month's free messages</Text>
      <Text style={styles.paywallText}>
        Your free messages renew next month, or subscribe now for unlimited chatting. Keeping this going costs
        a little to run — subscribing helps cover that.
      </Text>
      <TouchableOpacity
        style={styles.subscribeBtn}
        onPress={onSubscribe}
        accessibilityRole="button"
        accessibilityLabel="Subscribe for unlimited chat"
      >
        <Text style={styles.subscribeBtnText}>Subscribe for Unlimited Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ChatScreen({ store }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { chatAccess, recordChatMessageSent } = store;
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
      const reply = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      recordChatMessageSent();
    } catch (e) {
      setErrorMsg(e.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Subscriptions aren't wired up yet — this app has no App Store/Play
  // Console product or RevenueCat project behind it. Once that exists,
  // replace this with the real purchase flow and call
  // store.updateSettings({ chatSubscribed: true }) on success.
  const handleSubscribe = () => {
    Alert.alert("Coming soon", "Subscriptions aren't set up yet — check back soon.");
  };

  return (
    <View>
      <Text style={styles.title}>Talk to Barnabas</Text>
      <Text style={styles.subtitle}>
        A private, one-on-one conversation — ask questions or talk things through. Not a therapist, but a
        listening ear grounded in Scripture.
      </Text>

      {!chatAccess.granted ? (
        <ChatPaywall styles={styles} onSubscribe={handleSubscribe} />
      ) : (
        <>
          {!chatAccess.unlimited ? (
            <Text style={styles.quotaBanner}>
              {chatAccess.messagesLeft} of {chatAccess.limit} free messages left this month
            </Text>
          ) : (
            <Text style={styles.quotaBanner}>Unlimited chatting — thank you for subscribing ✨</Text>
          )}

          <View style={styles.messagesWrap}>
            {messages.length === 0 ? (
              <Text style={styles.emptyState}>Say hello — Barnabas is listening.</Text>
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
              placeholder="Type a message..."
              placeholderTextColor={colors.textSoft}
              multiline
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>If you're in crisis, please reach real help: {crisisResource.sentence}</Text>
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
