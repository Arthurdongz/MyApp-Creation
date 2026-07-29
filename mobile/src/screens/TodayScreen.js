import { useEffect, useMemo, useState } from "react";
import { Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Card from "../components/Card";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { pickForDay, pickForDaySmallBank } from "../content";
import { VERSES } from "../data/verses";
import { ENCOURAGEMENTS } from "../data/encouragements";
import { BARNABAS_MOMENTS } from "../data/moments";
import { WISDOM } from "../data/wisdom";
import { speak } from "../speech";
import { hapticSuccess, hapticTap } from "../haptics";

// The "Encouraging Thought" card is quotes-only now (true stories moved to
// their own Story tab, backed by data/stories.js). WISDOM still holds
// legacy "story"-type entries alongside quotes; filter down to just quotes.
const QUOTES = WISDOM.filter((w) => w.type === "quote");

const MOODS = [
  { key: "joyful", emoji: "😊", label: "Joyful" },
  { key: "peaceful", emoji: "🙂", label: "Peaceful" },
  { key: "hopeful", emoji: "🌱", label: "Hopeful" },
  { key: "tired", emoji: "😔", label: "Tired" },
  { key: "struggling", emoji: "😢", label: "Struggling" },
];

const MOMENT_INTENTIONS = [
  { key: "today", label: "Today" },
  { key: "tonight", label: "Tonight" },
  { key: "tomorrow", label: "Tomorrow morning" },
];

const MOMENT_INTENTION_LABELS = {
  today: "Today",
  tonight: "Tonight",
  tomorrow: "Tomorrow morning",
};

export default function TodayScreen({ store }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const {
    viewingDay,
    latestDay,
    isToday,
    order,
    today,
    settings,
    updateSettings,
    goToPrevDay,
    goToNextDay,
    jumpToToday,
    setMood,
    setMomentIntention,
    markMomentDone,
    answerMomentFollowUp,
    saveReflection,
    isFavorited,
    toggleFavorite,
  } = store;

  const verse = useMemo(() => pickForDay(VERSES, viewingDay, order), [viewingDay, order]);
  const encouragement = useMemo(() => pickForDay(ENCOURAGEMENTS, viewingDay, order), [viewingDay, order]);
  const quote = useMemo(() => pickForDaySmallBank(QUOTES, viewingDay, order), [viewingDay, order]);
  const moment = useMemo(() => pickForDay(BARNABAS_MOMENTS, viewingDay, order), [viewingDay, order]);

  const prevDayNumber = latestDay - 1;
  const prevEntry = store.state.entries[`day-${prevDayNumber}`];
  const prevMoment = useMemo(
    () => (prevDayNumber >= 1 ? pickForDay(BARNABAS_MOMENTS, prevDayNumber, order) : ""),
    [prevDayNumber, order]
  );
  const showMomentFollowUp =
    isToday &&
    prevDayNumber >= 1 &&
    !(prevEntry && prevEntry.momentDone) &&
    !(prevEntry && prevEntry.momentFollowUpAsked);

  const handleFollowUp = (status) => {
    hapticTap();
    answerMomentFollowUp(prevDayNumber, status);
  };

  const [reflection, setReflection] = useState(today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(today.barnabasNote || "");
  const [showSaved, setShowSaved] = useState(false);

  // The viewed day's saved reflection/note only comes through on first
  // mount via useState's initial value — keep the text boxes in sync
  // whenever the user navigates to a different day.
  useEffect(() => {
    setReflection(today.reflection || "");
    setBarnabasNote(today.barnabasNote || "");
    setShowSaved(false);
  }, [viewingDay]);

  const handleSave = () => {
    saveReflection(reflection, barnabasNote);
    hapticSuccess();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const verseSaved = isFavorited("verse", viewingDay);
  const quoteSaved = isFavorited("wisdom", viewingDay);

  const [sharePreview, setSharePreview] = useState(null);

  const shareMomentText = async () => {
    const message = `A little encouragement from me to you today: ${moment}\n\n— sent from Barnabas Journal`;
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  const reachOutToSomeone = async () => {
    const message = "Hey, I wanted to reach out today — just thinking of you. How are you doing?";
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  return (
    <View>
      <View style={styles.dayNav}>
        <View style={styles.dayNavRow}>
          <TouchableOpacity
            style={[styles.dayNavBtn, viewingDay <= 1 && styles.dayNavBtnDisabled]}
            onPress={goToPrevDay}
            disabled={viewingDay <= 1}
            accessibilityLabel="Previous day"
            accessibilityRole="button"
          >
            <Text style={styles.dayNavBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dayNavLabel}>{isToday ? `Today · Day ${viewingDay}` : `Day ${viewingDay}`}</Text>
          <TouchableOpacity
            style={[styles.dayNavBtn, viewingDay >= latestDay && styles.dayNavBtnDisabled]}
            onPress={goToNextDay}
            disabled={viewingDay >= latestDay}
            accessibilityLabel="Next day"
            accessibilityRole="button"
          >
            <Text style={styles.dayNavBtnText}>›</Text>
          </TouchableOpacity>
        </View>
        {!isToday ? (
          <TouchableOpacity onPress={jumpToToday}>
            <Text style={styles.dayNavJump}>Back to today</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showMomentFollowUp ? (
        <Card style={styles.followUpCard}>
          <Text style={styles.cardLabel}>Yesterday's Barnabas Moment</Text>
          <Text style={[styles.bodyText, { marginBottom: 12 }]}>{prevMoment}</Text>
          <Text style={styles.followUpQuestion}>Did you get to it?</Text>
          <View style={styles.followUpActions}>
            <TouchableOpacity style={styles.followUpBtn} onPress={() => handleFollowUp("done")}>
              <Text style={styles.followUpBtnText}>Yes, I did it 🎉</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followUpBtn} onPress={() => handleFollowUp("not_yet")}>
              <Text style={styles.followUpBtnText}>Not yet, but I still might</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followUpBtn} onPress={() => handleFollowUp("no")}>
              <Text style={styles.followUpBtnText}>No, not this time</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      <Card style={styles.verseCard}>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>Verse</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity onPress={() => speak(`${verse.text} — ${verse.ref}`, settings)}>
              <Text style={styles.favoriteBtn}>🔊 Listen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSharePreview({ text: verse.text, sourceLine: verse.ref })}
            >
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("verse", viewingDay, { text: verse.text, ref: verse.ref });
              }}
            >
              <Text style={[styles.favoriteBtn, verseSaved && styles.favoriteBtnActive]}>
                {verseSaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.verseText}>“{verse.text}”</Text>
        <Text style={styles.verseRef}>{verse.ref}</Text>
      </Card>

      <Card>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>A Word for You</Text>
          <TouchableOpacity onPress={() => speak(encouragement, settings)}>
            <Text style={styles.favoriteBtn}>🔊 Listen</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bodyText}>{encouragement}</Text>
      </Card>

      <Card>
        <View style={styles.cardLabelRow}>
          <Text style={styles.cardLabel}>Encouraging Thought</Text>
          <View style={styles.cardLabelActions}>
            <TouchableOpacity
              onPress={() => setSharePreview({ text: quote.text, sourceLine: `— ${quote.source || ""}` })}
            >
              <Text style={styles.favoriteBtn}>↗ Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                toggleFavorite("wisdom", viewingDay, { text: quote.text, source: quote.source || "" });
              }}
            >
              <Text style={[styles.favoriteBtn, quoteSaved && styles.favoriteBtnActive]}>
                {quoteSaved ? "★ Saved" : "☆ Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.bodyText}>“{quote.text}”</Text>
        <Text style={styles.wisdomSource}>— {quote.source}</Text>
      </Card>

      <Card style={styles.momentCard}>
        <Text style={styles.cardLabel}>Your Barnabas Moment</Text>
        <Text style={[styles.bodyText, { marginBottom: 14 }]}>{moment}</Text>

        {isToday && !today.momentDone ? (
          today.momentIntention ? (
            <View style={styles.intentionRow}>
              <Text style={styles.intentionText}>
                Planned for: {MOMENT_INTENTION_LABELS[today.momentIntention]}
              </Text>
              <TouchableOpacity onPress={() => setMomentIntention(null)}>
                <Text style={styles.intentionChange}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.intentionPrompt}>
              <Text style={styles.intentionPromptLabel}>When will you do this?</Text>
              <View style={styles.intentionOptions}>
                {MOMENT_INTENTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.intentionBtn}
                    onPress={() => {
                      hapticTap();
                      setMomentIntention(opt.key);
                    }}
                  >
                    <Text style={styles.intentionBtnText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        ) : null}

        <View style={styles.momentActions}>
          <TouchableOpacity
            style={[styles.button, today.momentDone && styles.buttonDisabled]}
            onPress={() => {
              hapticSuccess();
              markMomentDone();
            }}
            disabled={today.momentDone}
          >
            <Text style={styles.buttonText}>
              {today.momentDone ? "Done ✓" : isToday ? "I did this today ✓" : "I did this ✓"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={shareMomentText}>
            <Text style={styles.secondaryButtonText}>Send to someone</Text>
          </TouchableOpacity>
        </View>
        {today.momentDone ? (
          <Text style={styles.doneMsg}>Well done — that kindness mattered. ⭐⭐</Text>
        ) : null}
      </Card>

      <Card style={styles.reachOutCard}>
        <Text style={styles.cardLabel}>Reach Out</Text>
        <Text style={[styles.bodyText, { marginBottom: 14 }]}>
          If today feels heavy, you don't have to carry it alone. Send a message to someone who cares about you —
          even just to say hello.
        </Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={reachOutToSomeone}>
          <Text style={styles.secondaryButtonText}>💛 Reach Out to Someone</Text>
        </TouchableOpacity>
      </Card>

      <SharePreviewModal
        visible={!!sharePreview}
        mainText={sharePreview?.text || ""}
        sourceLine={sharePreview?.sourceLine || ""}
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setSharePreview(null)}
      />

      <Card>
        <Text style={styles.cardLabel}>{isToday ? "Today's Reflection" : `Day ${viewingDay}'s Reflection`}</Text>

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
              onPress={() => {
                hapticTap();
                setMood(m.key);
              }}
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
          <Text style={styles.doneMsg}>
            {isToday
              ? "Saved gently. Thank you for showing up today. ⭐⭐"
              : "Saved gently. Thank you for going back to this day. ⭐⭐"}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    dayNav: {
      alignItems: "center",
      marginBottom: 16,
      gap: 4,
    },
    dayNavRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    dayNavBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    dayNavBtnDisabled: { opacity: 0.35 },
    dayNavBtnText: { fontSize: 18, fontWeight: "700", color: colors.sageDark },
    dayNavLabel: { fontWeight: "700", fontSize: 14, color: colors.sageDark, minWidth: 110, textAlign: "center" },
    dayNavJump: { fontSize: 12, fontWeight: "700", color: colors.sky, textDecorationLine: "underline" },
    cardLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardLabelActions: {
      flexDirection: "row",
      gap: 6,
    },
    cardLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontSize: 11,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 10,
    },
    favoriteBtn: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 3,
      paddingHorizontal: 9,
      marginBottom: 10,
      overflow: "hidden",
    },
    favoriteBtnActive: { color: colors.goldText, borderColor: colors.goldText },
    verseCard: { backgroundColor: colors.verseCard },
    momentCard: { backgroundColor: colors.momentCard },
    reachOutCard: { backgroundColor: colors.reachOutCard },
    followUpCard: { backgroundColor: colors.momentCard },
    followUpQuestion: { fontSize: 13, fontWeight: "600", color: colors.sageDark, marginBottom: 10 },
    followUpActions: { gap: 8 },
    followUpBtn: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: "center",
    },
    followUpBtnText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
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
    momentActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    intentionPrompt: { marginBottom: 14 },
    intentionPromptLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      marginBottom: 8,
    },
    intentionOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    intentionBtn: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    intentionBtnText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    intentionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    intentionText: { fontSize: 13, fontWeight: "600", color: colors.sageDark },
    intentionChange: { fontSize: 12, color: colors.textSoft, textDecorationLine: "underline" },
    secondaryButton: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: { color: colors.sageDark, fontWeight: "700", fontSize: 13 },
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
      backgroundColor: colors.input,
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
      backgroundColor: colors.card,
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
}
