import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Card from "../components/Card";
import { colors } from "../theme";
import { pickForToday } from "../content";
import { VERSES } from "../data/verses";
import { ENCOURAGEMENTS } from "../data/encouragements";
import { BARNABAS_MOMENTS } from "../data/moments";
import { WISDOM } from "../data/wisdom";

const MOODS = [
  { key: "joyful", emoji: "😊", label: "Joyful" },
  { key: "peaceful", emoji: "🙂", label: "Peaceful" },
  { key: "hopeful", emoji: "🌱", label: "Hopeful" },
  { key: "tired", emoji: "😔", label: "Tired" },
  { key: "struggling", emoji: "😢", label: "Struggling" },
];

export default function TodayScreen({ store }) {
  const verse = useMemo(() => pickForToday(VERSES), []);
  const encouragement = useMemo(() => pickForToday(ENCOURAGEMENTS), []);
  const wisdom = useMemo(() => pickForToday(WISDOM), []);
  const moment = useMemo(() => pickForToday(BARNABAS_MOMENTS), []);

  const { today, setMood, markMomentDone, saveReflection } = store;

  const [reflection, setReflection] = useState(today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(today.barnabasNote || "");
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    saveReflection(reflection, barnabasNote);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <View>
      <Card style={styles.verseCard}>
        <Text style={styles.cardLabel}>Today's Verse</Text>
        <Text style={styles.verseText}>“{verse.text}”</Text>
        <Text style={styles.verseRef}>{verse.ref}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>A Word for You Today</Text>
        <Text style={styles.bodyText}>{encouragement}</Text>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>On Encouragement &amp; Hope</Text>
        {wisdom.type === "story" ? (
          <Text style={styles.bodyText}>{wisdom.text}</Text>
        ) : (
          <>
            <Text style={styles.bodyText}>“{wisdom.text}”</Text>
            <Text style={styles.wisdomSource}>— {wisdom.source}</Text>
          </>
        )}
      </Card>

      <Card style={styles.momentCard}>
        <Text style={styles.cardLabel}>Your Barnabas Moment</Text>
        <Text style={[styles.bodyText, { marginBottom: 14 }]}>{moment}</Text>
        <TouchableOpacity
          style={[styles.button, today.momentDone && styles.buttonDisabled]}
          onPress={markMomentDone}
          disabled={today.momentDone}
        >
          <Text style={styles.buttonText}>{today.momentDone ? "Done today ✓" : "I did this today ✓"}</Text>
        </TouchableOpacity>
        {today.momentDone ? (
          <Text style={styles.doneMsg}>Well done — that kindness mattered. ⭐⭐</Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Today's Reflection</Text>

        <Text style={styles.fieldLabel}>What's on your heart today?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={3}
          placeholder="Write freely — this is just for you..."
          placeholderTextColor={colors.textSoft}
          value={reflection}
          onChangeText={setReflection}
        />

        <Text style={styles.fieldLabel}>
          Your Barnabas moment — what did you do, and how did it feel?
        </Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={3}
          placeholder="What did you do for someone today, and how did it feel?"
          placeholderTextColor={colors.textSoft}
          value={barnabasNote}
          onChangeText={setBarnabasNote}
        />

        <Text style={styles.fieldLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.moodBtn, today.mood === m.key && styles.moodBtnSelected]}
              onPress={() => setMood(m.key)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Reflection</Text>
        </TouchableOpacity>
        {showSaved ? (
          <Text style={styles.doneMsg}>Saved gently. Thank you for showing up today. ⭐⭐</Text>
        ) : null}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontWeight: "700",
    color: colors.sageDark,
    marginBottom: 10,
  },
  verseCard: { backgroundColor: colors.verseCard },
  momentCard: { backgroundColor: colors.momentCard },
  verseText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 10,
  },
  verseRef: {
    fontSize: 13,
    color: colors.sageDark,
    fontWeight: "600",
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  wisdomSource: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textSoft,
    textAlign: "right",
  },
  button: {
    backgroundColor: colors.sage,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  doneMsg: {
    marginTop: 10,
    fontSize: 14,
    color: colors.sageDark,
    fontWeight: "600",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSoft,
    marginTop: 14,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "#fffefc",
    textAlignVertical: "top",
    minHeight: 70,
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moodBtn: {
    flexGrow: 1,
    flexBasis: "18%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  moodBtnSelected: {
    backgroundColor: colors.verseCard,
    borderColor: colors.sage,
  },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 10, fontWeight: "600", color: colors.textSoft, marginTop: 4 },
});
