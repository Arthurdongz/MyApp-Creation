import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";

// Keep in sync with chat-worker/worker.js's PERSONA_STYLES keys — each one
// needs a matching chat.persona.styles.<key>.label/description in every
// locale (see mobile/src/i18n/locales/*.json).
export const CHAT_PERSONA_STYLES = ["friend", "mentor", "coach", "direct", "playful"];

// Keep in sync with the Worker's PERSONA_NOTE_MAX_LEN — this is a client-
// side UX cap (stops typing past it), the Worker's is the actual security
// boundary in case a tampered client ignores this one.
const NOTE_MAX_LEN = 300;

// Lets the user tell Barnabas how to talk to them — a tone preference
// (friend/mentor/coach/etc.) plus an optional free-text note — the same
// idea as ChatGPT's custom instructions, scoped to just conversational
// style rather than anything that could touch the safety/scripture-
// grounding rules (see the Worker's systemPromptFor, which frames whatever
// is chosen here as a stated preference, never a new instruction).
export default function ChatPersonaModal({ visible, style, note, onClose, onSave }) {
  const { colors, shadow } = useTheme();
  const styles = getStyles(colors, shadow);
  const { t } = useTranslation();
  const [selectedStyle, setSelectedStyle] = useState(style);
  const [draftNote, setDraftNote] = useState(note);

  // Re-seed the draft from the current settings every time the modal
  // opens, rather than carrying over whatever was typed last time it was
  // dismissed without saving.
  useEffect(() => {
    if (visible) {
      setSelectedStyle(style);
      setDraftNote(note);
    }
  }, [visible, style, note]);

  const handleSave = () => {
    hapticTap();
    onSave(selectedStyle, draftNote.trim());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("chat.persona.title")}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel={t("chat.persona.closeLabel")}
              accessibilityRole="button"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{t("chat.persona.subtitle")}</Text>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 4 }}>
            <View style={styles.styleGrid}>
              {CHAT_PERSONA_STYLES.map((key) => {
                const selected = selectedStyle === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.styleChip, selected && styles.styleChipSelected]}
                    onPress={() => {
                      hapticTap();
                      setSelectedStyle(key);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.styleChipLabel, selected && styles.styleChipLabelSelected]}>
                      {t(`chat.persona.styles.${key}.label`)}
                    </Text>
                    <Text style={[styles.styleChipDescription, selected && styles.styleChipDescriptionSelected]}>
                      {t(`chat.persona.styles.${key}.description`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.noteLabel}>{t("chat.persona.noteLabel")}</Text>
            <TextInput
              style={styles.noteInput}
              value={draftNote}
              onChangeText={(v) => setDraftNote(v.slice(0, NOTE_MAX_LEN))}
              placeholder={t("chat.persona.notePlaceholder")}
              placeholderTextColor={colors.textSoft}
              multiline
              maxLength={NOTE_MAX_LEN}
            />
            <Text style={styles.noteHint}>{t("chat.persona.noteHint", { count: draftNote.length })}</Text>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityRole="button">
            <Text style={styles.saveBtnText}>{t("chat.persona.saveButton")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(colors, shadow) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(20, 24, 18, 0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: "100%",
      maxWidth: 420,
      maxHeight: "80%",
      ...shadow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.sageDark, flexShrink: 1, marginRight: 12 },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: { fontSize: 13, color: colors.textSoft },
    subtitle: { fontSize: 13, color: colors.textSoft, lineHeight: 18, marginBottom: 14 },
    body: {},
    styleGrid: { gap: 10 },
    styleChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    styleChipSelected: {
      borderColor: colors.sageDark,
      backgroundColor: colors.factCard,
    },
    styleChipLabel: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 2 },
    styleChipLabelSelected: { color: colors.sageDark },
    styleChipDescription: { fontSize: 12, color: colors.textSoft, lineHeight: 16 },
    styleChipDescriptionSelected: { color: colors.sageDark },
    noteLabel: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 16, marginBottom: 8 },
    noteInput: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      minHeight: 70,
      textAlignVertical: "top",
    },
    noteHint: { fontSize: 11, color: colors.textSoft, textAlign: "right", marginTop: 4 },
    saveBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: "center",
      marginTop: 16,
    },
    saveBtnText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
  });
}
