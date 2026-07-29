import { useEffect, useMemo, useState } from "react";
import { Linking, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

function truncateForPreview(text) {
  const trimmed = text.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90).trimEnd()}…` : trimmed;
}

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
    setCustomMoment,
    markMomentDone,
    answerMomentFollowUp,
    saveReflection,
    isFavorited,
    toggleFavorite,
  } = store;

  const verse = useMemo(() => pickForDay(VERSES, viewingDay, order), [viewingDay, order]);
  const encouragement = useMemo(() => pickForDay(ENCOURAGEMENTS, viewingDay, order), [viewingDay, order]);
  const quote = useMemo(() => pickForDaySmallBank(QUOTES, viewingDay, order), [viewingDay, order]);
  const suggestedMoment = useMemo(() => pickForDay(BARNABAS_MOMENTS, viewingDay, order), [viewingDay, order]);
  const moment = today.customMoment || suggestedMoment;

  const [showCustomMomentInput, setShowCustomMomentInput] = useState(false);
  const [customMomentInput, setCustomMomentInput] = useState("");

  const prevDayNumber = latestDay - 1;
  const prevEntry = store.state.entries[`day-${prevDayNumber}`];
  const prevMoment = useMemo(() => {
    if (prevDayNumber < 1) return "";
    if (prevEntry && prevEntry.customMoment) return prevEntry.customMoment;
    return pickForDay(BARNABAS_MOMENTS, prevDayNumber, order);
  }, [prevDayNumber, prevEntry, order]);
  const showMomentFollowUp =
    isToday &&
    prevDayNumber >= 1 &&
    !(prevEntry && prevEntry.momentDone) &&
    !(prevEntry && prevEntry.momentFollowUpAsked);

  // Shown only on two calendar weekdays (Wednesday, Saturday) — a deliberate
  // once-or-twice-a-week cadence, not a daily nag, so it keeps its weight.
  const todayWeekday = new Date().getDay();
  const showCallNudge = isToday && (todayWeekday === 3 || todayWeekday === 6);
  const showCheckInNudge = isToday && store.showCheckInNudge;
  const showCrisisNudge = isToday && store.showCrisisNudge;
  const showSupportSection = showCallNudge || showCheckInNudge || showCrisisNudge;

  const handleFollowUp = (status) => {
    hapticTap();
    answerMomentFollowUp(prevDayNumber, status);
  };

  const handleUseCustomMoment = () => {
    if (!customMomentInput.trim()) return;
    hapticTap();
    setCustomMoment(customMomentInput);
    setShowCustomMomentInput(false);
  };

  const handleUseSuggestion = () => {
    hapticTap();
    setCustomMoment("");
    setCustomMomentInput("");
  };

  const [reflection, setReflection] = useState(today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(today.barnabasNote || "");
  const [receivedKindness, setReceivedKindness] = useState(today.receivedKindness || "");
  const [showSaved, setShowSaved] = useState(false);
  const [showMomentReflectSaved, setShowMomentReflectSaved] = useState(false);
  const [showWordReflectPrompt, setShowWordReflectPrompt] = useState(false);
  const [showWordReflectSaved, setShowWordReflectSaved] = useState(false);

  // The three "Reflect on Today" fields are shown as accordion rows. Each
  // one's open/closed state defaults to whether the viewed day already has
  // text in it, so a returning user sees their own words immediately —
  // reset (recomputed) only when the viewed day itself changes.
  const [heartOpen, setHeartOpen] = useState(Boolean(today.reflection));
  const [barnabasOpen, setBarnabasOpen] = useState(Boolean(today.barnabasNote));
  const [kindnessOpen, setKindnessOpen] = useState(Boolean(today.receivedKindness));

  // The viewed day's saved reflection/note only comes through on first
  // mount via useState's initial value — keep the text boxes in sync
  // whenever the user navigates to a different day.
  useEffect(() => {
    setReflection(today.reflection || "");
    setBarnabasNote(today.barnabasNote || "");
    setReceivedKindness(today.receivedKindness || "");
    setShowSaved(false);
    setShowCustomMomentInput(false);
    setCustomMomentInput("");
    setShowWordReflectPrompt(false);
    setHeartOpen(Boolean(today.reflection));
    setBarnabasOpen(Boolean(today.barnabasNote));
    setKindnessOpen(Boolean(today.receivedKindness));
  }, [viewingDay]);

  const handleSave = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    hapticSuccess();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleWordReflectSave = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    hapticSuccess();
    setShowWordReflectPrompt(false);
    setShowWordReflectSaved(true);
    setTimeout(() => setShowWordReflectSaved(false), 2500);
  };

  const handleMomentReflectSave = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    hapticSuccess();
    setShowMomentReflectSaved(true);
    setTimeout(() => setShowMomentReflectSaved(false), 2500);
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

  const talkToSomeone = async () => {
    const message = "Hey, do you have a few minutes to talk? I could use a listening ear lately.";
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  const supportBlocks = [];
  if (showCrisisNudge) {
    supportBlocks.push({
      key: "crisis",
      content: (
        <>
          <Text style={styles.cardLabel}>A Resource, If You Need It</Text>
          <Text style={[styles.bodyText, { marginBottom: 10 }]}>
            It looks like the last little while has been heavy for you. That matters, and you don't have to
            carry it by yourself.
          </Text>
          <Text style={[styles.bodyText, { marginBottom: 14 }]}>
            If you're in the US, the 988 Suicide &amp; Crisis Lifeline is free and confidential, day or
            night — call or text 988. You can also text HOME to 741741 to reach the Crisis Text Line.
            Outside the US, searching "crisis line" with your country's name will find a local number.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL("tel:988")}>
            <Text style={styles.secondaryButtonText}>📞 Call 988</Text>
          </TouchableOpacity>
        </>
      ),
    });
  }
  if (showCheckInNudge) {
    supportBlocks.push({
      key: "checkin",
      content:
        store.checkInNudgeVariant === "talk" ? (
          <>
            <Text style={styles.cardLabel}>Since It's Been Heavy Lately</Text>
            <Text style={[styles.bodyText, { marginBottom: 14 }]}>
              This past week has felt like a lot. A problem shared is a problem halved — is there
              someone you trust that you could talk to about how you're really doing?
            </Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={talkToSomeone}>
              <Text style={styles.secondaryButtonText}>💬 Talk to Someone</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.cardLabel}>A Moment to Pause</Text>
            <Text style={styles.bodyText}>
              In this heavy season, pause for a moment: what's one small thing you're grateful for
              right now, even if it's tiny? And think back — is there something that once felt
              impossible to get through, that you made it through anyway? You can again.
            </Text>
          </>
        ),
    });
  }
  if (showCallNudge) {
    supportBlocks.push({
      key: "call",
      content: (
        <>
          <Text style={styles.cardLabel}>A Little Further This Week</Text>
          <Text style={[styles.bodyText, { marginBottom: 14 }]}>
            A text is easy to send, and just as easy to scroll past. Is there someone you could actually
            call, or see face to face, instead of just texting today?
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL("tel:")}>
            <Text style={styles.secondaryButtonText}>📞 Call Someone</Text>
          </TouchableOpacity>
        </>
      ),
    });
  }

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

      {/* Today's Reading: Verse, A Word for You, Encouraging Thought grouped as one card */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>📖</Text>
          <Text style={styles.sectionGroupTitle}>Today's Reading</Text>
        </View>
        <View style={[styles.unifiedCard, styles.readingCard]}>
          <View style={styles.unifiedBlock}>
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
          </View>

          <View style={[styles.unifiedBlock, styles.unifiedBlockDivider]}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>A Word for You</Text>
              <TouchableOpacity onPress={() => speak(encouragement, settings)}>
                <Text style={styles.favoriteBtn}>🔊 Listen</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.bodyText}>{encouragement}</Text>

            {!today.reflection ? (
              showWordReflectPrompt ? (
                <View style={styles.customMomentPrompt}>
                  <TextInput
                    style={[styles.textArea, { marginTop: 12 }]}
                    multiline
                    numberOfLines={2}
                    placeholder="What does this stir in you?"
                    placeholderTextColor={colors.textSoft}
                    value={reflection}
                    onChangeText={setReflection}
                  />
                  <View style={styles.customMomentBtnRow}>
                    <TouchableOpacity style={styles.momentReflectSaveBtn} onPress={handleWordReflectSave}>
                      <Text style={styles.momentReflectSaveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowWordReflectPrompt(false)}>
                      <Text style={styles.intentionChange}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.customMomentLinkWrap, { marginTop: 12, marginBottom: 0 }]}
                  onPress={() => {
                    hapticTap();
                    setShowWordReflectPrompt(true);
                  }}
                >
                  <Text style={styles.customMomentLink}>Let this sit for a moment — what does it stir in you?</Text>
                </TouchableOpacity>
              )
            ) : null}
            {showWordReflectSaved ? (
              <Text style={[styles.momentReflectSavedMsg, { marginTop: 12 }]}>
                Saved. Thank you for sitting with that. ⭐⭐
              </Text>
            ) : null}
          </View>

          <View style={[styles.unifiedBlock, styles.unifiedBlockDivider]}>
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
          </View>
        </View>
      </View>

      {/* Your Barnabas Moment: yesterday's follow-up folded in as an inset strip, Reach Out folded in as an inline link */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>🤝</Text>
          <Text style={styles.sectionGroupTitle}>Your Barnabas Moment</Text>
        </View>
        <Card style={styles.momentCard}>
          {showMomentFollowUp ? (
            <View style={styles.followUpStrip}>
              <Text style={styles.followUpStripLabel}>Yesterday, you planned to:</Text>
              <Text style={[styles.followUpStripText, { marginBottom: 12 }]}>{prevMoment}</Text>
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
            </View>
          ) : null}

          <Text style={[styles.bodyText, { marginBottom: 14 }]}>{moment}</Text>

          {!today.momentDone ? (
            today.customMoment ? (
              <View style={styles.customMomentRow}>
                <Text style={styles.customMomentNote}>This is your own idea for today.</Text>
                <TouchableOpacity onPress={handleUseSuggestion}>
                  <Text style={styles.intentionChange}>Use today's suggestion instead</Text>
                </TouchableOpacity>
              </View>
            ) : showCustomMomentInput ? (
              <View style={styles.customMomentPrompt}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={2}
                  placeholder="What's your own act of kindness today?"
                  placeholderTextColor={colors.textSoft}
                  value={customMomentInput}
                  onChangeText={setCustomMomentInput}
                />
                <View style={styles.customMomentBtnRow}>
                  <TouchableOpacity style={styles.momentReflectSaveBtn} onPress={handleUseCustomMoment}>
                    <Text style={styles.momentReflectSaveBtnText}>Use this instead</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowCustomMomentInput(false)}>
                    <Text style={styles.intentionChange}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.customMomentLinkWrap}
                onPress={() => {
                  hapticTap();
                  setShowCustomMomentInput(true);
                }}
              >
                <Text style={styles.customMomentLink}>Or, write your own kindness for today</Text>
              </TouchableOpacity>
            )
          ) : null}

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
            <>
              <Text style={styles.doneMsg}>Well done — that kindness mattered. ⭐⭐</Text>
              {!today.barnabasNote ? (
                <View style={styles.momentReflectPrompt}>
                  <Text style={styles.momentReflectLabel}>What happened? (optional)</Text>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={2}
                    placeholder="What happened when you did it?"
                    placeholderTextColor={colors.textSoft}
                    value={barnabasNote}
                    onChangeText={setBarnabasNote}
                  />
                  <TouchableOpacity style={styles.momentReflectSaveBtn} onPress={handleMomentReflectSave}>
                    <Text style={styles.momentReflectSaveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              {showMomentReflectSaved ? (
                <Text style={styles.momentReflectSavedMsg}>Saved. Thank you for sharing that. ⭐⭐</Text>
              ) : null}
            </>
          ) : null}

          <View style={styles.reachOutInline}>
            <Text style={styles.reachOutInlineText}>💛 If today feels heavy —</Text>
            <TouchableOpacity onPress={reachOutToSomeone}>
              <Text style={styles.reachOutInlineLink}>reach out to someone who cares</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* A Little Extra Support: call nudge / check-in nudge / crisis resource unified into one card */}
      {showSupportSection ? (
        <View style={styles.sectionGroup}>
          <View style={styles.sectionGroupHeader}>
            <Text style={styles.sectionGroupIcon}>💬</Text>
            <Text style={styles.sectionGroupTitle}>A Little Extra Support</Text>
          </View>
          <View style={[styles.unifiedCard, styles.supportCard]}>
            {supportBlocks.map((block, i) => (
              <View key={block.key} style={[styles.unifiedBlock, i > 0 && styles.unifiedBlockDivider]}>
                {block.content}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <SharePreviewModal
        visible={!!sharePreview}
        mainText={sharePreview?.text || ""}
        sourceLine={sharePreview?.sourceLine || ""}
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setSharePreview(null)}
      />

      {/* Reflect on Today: three journal fields as accordion rows */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>📝</Text>
          <Text style={styles.sectionGroupTitle}>
            {isToday ? "Today's Reflection" : `Day ${viewingDay}'s Reflection`}
          </Text>
        </View>
        <Card>
          <View style={styles.accordionRow}>
            <TouchableOpacity
              style={styles.accordionRowHead}
              onPress={() => {
                hapticTap();
                setHeartOpen((v) => !v);
              }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>💭</Text>
                <Text style={styles.accordionRowTitle}>What's on your heart today?</Text>
              </View>
              <Text style={[styles.accordionChevron, heartOpen && styles.accordionChevronOpen]}>›</Text>
            </TouchableOpacity>
            {!heartOpen && today.reflection ? (
              <Text style={styles.accordionPreview}>{truncateForPreview(today.reflection)}</Text>
            ) : null}
            {heartOpen ? (
              <View style={styles.accordionRowBody}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="Write freely — this is just for you..."
                  placeholderTextColor={colors.textSoft}
                  value={reflection}
                  onChangeText={setReflection}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.accordionRow}>
            <TouchableOpacity
              style={styles.accordionRowHead}
              onPress={() => {
                hapticTap();
                setBarnabasOpen((v) => !v);
              }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>🤝</Text>
                <Text style={styles.accordionRowTitle}>
                  Your Barnabas moment — what did you do, and how did it feel?
                </Text>
              </View>
              <Text style={[styles.accordionChevron, barnabasOpen && styles.accordionChevronOpen]}>›</Text>
            </TouchableOpacity>
            {!barnabasOpen && today.barnabasNote ? (
              <Text style={styles.accordionPreview}>{truncateForPreview(today.barnabasNote)}</Text>
            ) : null}
            {barnabasOpen ? (
              <View style={styles.accordionRowBody}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="What did you do for someone today, and how did it feel?"
                  placeholderTextColor={colors.textSoft}
                  value={barnabasNote}
                  onChangeText={setBarnabasNote}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.accordionRow}>
            <TouchableOpacity
              style={styles.accordionRowHead}
              onPress={() => {
                hapticTap();
                setKindnessOpen((v) => !v);
              }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>💛</Text>
                <Text style={styles.accordionRowTitle}>
                  Someone watered me today — did anyone show you kindness?
                </Text>
              </View>
              <Text style={[styles.accordionChevron, kindnessOpen && styles.accordionChevronOpen]}>›</Text>
            </TouchableOpacity>
            {!kindnessOpen && today.receivedKindness ? (
              <Text style={styles.accordionPreview}>{truncateForPreview(today.receivedKindness)}</Text>
            ) : null}
            {kindnessOpen ? (
              <View style={styles.accordionRowBody}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="What did someone do for you today, and how did it feel?"
                  placeholderTextColor={colors.textSoft}
                  value={receivedKindness}
                  onChangeText={setReceivedKindness}
                />
              </View>
            ) : null}
          </View>

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
    sectionGroup: { marginBottom: 6 },
    sectionGroupHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      marginLeft: 2,
    },
    sectionGroupIcon: { fontSize: 16 },
    sectionGroupTitle: { fontSize: 15, fontWeight: "700", color: colors.sageDark },
    unifiedCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 16,
    },
    readingCard: { backgroundColor: colors.verseCard },
    supportCard: { backgroundColor: colors.reachOutCard },
    unifiedBlock: { padding: 20 },
    unifiedBlockDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
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
    momentCard: { backgroundColor: colors.momentCard },
    followUpStrip: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.sage,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    followUpStripLabel: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      color: colors.sageDark,
      marginBottom: 4,
    },
    followUpStripText: { fontSize: 14, color: colors.text },
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
    momentReflectPrompt: { marginTop: 14 },
    momentReflectLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      marginBottom: 6,
    },
    momentReflectSaveBtn: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginTop: 8,
    },
    momentReflectSaveBtnText: { fontSize: 13, fontWeight: "700", color: colors.sageDark },
    momentReflectSavedMsg: {
      marginTop: 8,
      fontSize: 13,
      color: colors.sageDark,
      fontWeight: "600",
    },
    reachOutInline: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    reachOutInlineText: { fontSize: 13.5, color: colors.textSoft },
    reachOutInlineLink: {
      fontSize: 13.5,
      fontWeight: "700",
      color: colors.goldText,
      textDecorationLine: "underline",
    },
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
    customMomentLinkWrap: { marginBottom: 14 },
    customMomentLink: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      textDecorationLine: "underline",
    },
    customMomentPrompt: { marginBottom: 14 },
    customMomentBtnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginTop: 8,
    },
    customMomentRow: { marginBottom: 14 },
    customMomentNote: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      marginBottom: 4,
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
    accordionRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.input,
      marginBottom: 10,
      overflow: "hidden",
    },
    accordionRowHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: 13,
    },
    accordionRowTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      flex: 1,
    },
    accordionEmoji: { fontSize: 15 },
    accordionRowTitle: { flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text },
    accordionChevron: { fontSize: 16, color: colors.textSoft },
    accordionChevronOpen: { transform: [{ rotate: "90deg" }] },
    accordionRowBody: { paddingHorizontal: 13, paddingBottom: 13 },
    accordionPreview: {
      fontSize: 12.5,
      color: colors.textSoft,
      fontStyle: "italic",
      paddingHorizontal: 13,
      paddingBottom: 13,
      marginTop: -6,
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
