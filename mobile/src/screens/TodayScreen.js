import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Linking, Platform, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Card from "../components/Card";
import ActionMenu from "../components/ActionMenu";
import SharePreviewModal from "../components/SharePreviewModal";
import VersePopup from "../components/VersePopup";
import { useTheme } from "../theme";
import { getCrisisResource, resolveCrisisRegion } from "../crisisResources";
import { pickForDay, pickForDaySmallBank, pickVerseVersion, TOTAL_DAYS } from "../content";
import { BADGE_DEFS } from "../storage";
import { BIBLE_VERSIONS, VERSES } from "../data/verses";
import { CONFESSIONS } from "../data/confessions";
import { ENCOURAGEMENTS } from "../data/encouragements";
import { ENCOURAGEMENTS_ES } from "../data/encouragements.es";
import { ENCOURAGEMENTS_PT } from "../data/encouragements.pt";
import { ENCOURAGEMENTS_FR } from "../data/encouragements.fr";
import { BARNABAS_MOMENTS } from "../data/moments";
import { BARNABAS_MOMENTS_ES } from "../data/moments.es";
import { BARNABAS_MOMENTS_PT } from "../data/moments.pt";
import { BARNABAS_MOMENTS_FR } from "../data/moments.fr";
import { WISDOM } from "../data/wisdom";
import { QUOTES_ES } from "../data/quotes.es";
import { QUOTES_PT } from "../data/quotes.pt";
import { QUOTES_FR } from "../data/quotes.fr";
import { STORIES } from "../data/stories";
import { STORIES_ES } from "../data/stories.es";
import { STORIES_PT } from "../data/stories.pt";
import { STORIES_FR } from "../data/stories.fr";
import { speak } from "../speech";
import { hapticSuccess, hapticTap } from "../haptics";
import { scheduleMomentReminder, cancelMomentReminder } from "../notifications";

// The stars a completed Barnabas Moment awards — kept in sync with the "2"
// literal in storage.js's markMomentDone, since that's the only place the
// award is actually granted; this is purely for the "+2 ⭐" UI hints below.
const MOMENT_STAR_REWARD = 2;

// The "Encouraging Thought" card is quotes-only now (true stories moved to
// their own Story tab, backed by data/stories.js; facts moved to their own
// Facts tab, backed by data/highlights.js). WISDOM still holds legacy
// "story"-type entries alongside quotes; filter down to just quotes.
const QUOTES = WISDOM.filter((w) => w.type === "quote");

const MOMENT_INTENTION_KEYS = ["today", "tonight", "tomorrow"];

const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);

function truncateForPreview(text, maxLen = 90) {
  const trimmed = text.trim();
  return trimmed.length > maxLen ? `${trimmed.slice(0, maxLen).trimEnd()}…` : trimmed;
}

const ENCOURAGEMENTS_BY_LANG = { es: ENCOURAGEMENTS_ES, pt: ENCOURAGEMENTS_PT, fr: ENCOURAGEMENTS_FR };
const BARNABAS_MOMENTS_BY_LANG = { es: BARNABAS_MOMENTS_ES, pt: BARNABAS_MOMENTS_PT, fr: BARNABAS_MOMENTS_FR };
const QUOTES_BY_LANG = { es: QUOTES_ES, pt: QUOTES_PT, fr: QUOTES_FR };
const STORIES_BY_LANG = { es: STORIES_ES, pt: STORIES_PT, fr: STORIES_FR };

export default function TodayScreen({ store, scrollViewRef, onOpenReflection, onOpenStory }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const encouragementsBank = ENCOURAGEMENTS_BY_LANG[i18n.language] || ENCOURAGEMENTS;
  const momentsBank = BARNABAS_MOMENTS_BY_LANG[i18n.language] || BARNABAS_MOMENTS;
  const quotesBank = QUOTES_BY_LANG[i18n.language] || QUOTES;
  const storiesBank = STORIES_BY_LANG[i18n.language] || STORIES;

  const MOMENT_INTENTIONS = MOMENT_INTENTION_KEYS.map((key) => ({
    key,
    label: t(`today.momentIntentions.${key}`),
  }));
  const MOMENT_INTENTION_LABELS = Object.fromEntries(
    MOMENT_INTENTION_KEYS.map((key) => [key, t(`today.momentIntentions.${key}`)])
  );

  const {
    viewingDay,
    latestDay,
    isToday,
    order,
    today,
    settings,
    updateSettings,
    streak,
    momentsDone,
    totalStars,
    goToPrevDay,
    goToNextDay,
    jumpToToday,
    setMomentIntention,
    setCustomMoment,
    markMomentDone,
    answerMomentFollowUp,
    saveReflection,
    isFavorited,
    toggleFavorite,
  } = store;

  const verse = useMemo(() => {
    const entry = pickForDay(VERSES, viewingDay, order);
    const version = pickVerseVersion(viewingDay, settings, VERSE_VERSION_IDS);
    return { ref: entry.ref, version, text: entry.versions[version] || entry.versions.KJV };
  }, [viewingDay, order, settings.verseVersionMode, settings.verseFavoriteVersion]);
  const confession = useMemo(() => pickForDay(CONFESSIONS, viewingDay, order), [viewingDay, order]);
  const encouragement = useMemo(
    () => pickForDay(encouragementsBank, viewingDay, order),
    [encouragementsBank, viewingDay, order]
  );
  const quote = useMemo(
    () => pickForDaySmallBank(quotesBank, viewingDay, order),
    [quotesBank, viewingDay, order]
  );
  const suggestedMoment = useMemo(
    () => pickForDay(momentsBank, viewingDay, order),
    [momentsBank, viewingDay, order]
  );
  const moment = today.customMoment || suggestedMoment;
  const story = useMemo(
    () => pickForDaySmallBank(storiesBank, viewingDay, order),
    [storiesBank, viewingDay, order]
  );

  const [showCustomMomentInput, setShowCustomMomentInput] = useState(false);
  const [customMomentInput, setCustomMomentInput] = useState("");

  const prevDayNumber = latestDay - 1;
  const prevEntry = store.state.entries[`day-${prevDayNumber}`];
  const prevMoment = useMemo(() => {
    if (prevDayNumber < 1) return "";
    if (prevEntry && prevEntry.customMoment) return prevEntry.customMoment;
    return pickForDay(momentsBank, prevDayNumber, order);
  }, [prevDayNumber, prevEntry, order, momentsBank]);
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

  // When the check-in nudge fires (a sign the last week has felt heavy), pair
  // it with one of the user's own saved favorite verses rather than a fresh
  // unfamiliar one — something they already chose to keep, handed back at a
  // moment it might actually help. Picked deterministically off the day
  // number so it's stable within a day but varies across occurrences.
  const favoriteVerses = useMemo(
    () => (store.favorites || []).filter((f) => f.type === "verse"),
    [store.favorites]
  );
  const nudgeVerse =
    showCheckInNudge && favoriteVerses.length > 0
      ? favoriteVerses[viewingDay % favoriteVerses.length]
      : null;

  // Whichever badge is numerically closer — a streak day or a star — becomes
  // the one-line teaser near the moment header. BADGE_DEFS is already
  // ascending by threshold within each type, sorted again here defensively
  // rather than relying on definition order.
  const nextMilestone = useMemo(() => {
    const nextStreakBadge = BADGE_DEFS.filter((b) => b.type === "streak" && b.threshold > streak).sort(
      (a, b) => a.threshold - b.threshold
    )[0];
    const nextStarBadge = BADGE_DEFS.filter((b) => b.type === "stars" && b.threshold > totalStars).sort(
      (a, b) => a.threshold - b.threshold
    )[0];
    const streakRemaining = nextStreakBadge ? nextStreakBadge.threshold - streak : Infinity;
    const starRemaining = nextStarBadge ? nextStarBadge.threshold - totalStars : Infinity;
    if (streakRemaining === Infinity && starRemaining === Infinity) return null;
    return streakRemaining <= starRemaining
      ? { type: "streak", remaining: streakRemaining }
      : { type: "stars", remaining: starRemaining };
  }, [streak, totalStars]);

  // The moment card collapses to a one-line summary once it's done, as long
  // as there's nothing else pending on it (yesterday's follow-up question
  // takes priority and keeps the full card open).
  const canCollapseMoment = today.momentDone && !showMomentFollowUp;

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

  // Only true for a completion that happened during this screen visit — set
  // directly by the button's own handler, never inferred from today.momentDone
  // itself, so revisiting an already-done day (or navigating back to it)
  // shows the plain, permanent doneMsg rather than replaying the celebration.
  const [justCompleted, setJustCompleted] = useState(false);
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  const handleMarkDone = () => {
    if (today.momentDone) return;
    hapticSuccess();
    setJustCompleted(true);
    markMomentDone();
    cancelMomentReminder();
    setReminderScheduled(false);
  };

  useEffect(() => {
    if (!justCompleted) return;
    celebrateAnim.setValue(0);
    Animated.spring(celebrateAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [justCompleted, celebrateAnim]);

  const handleReadStory = () => {
    hapticTap();
    scrollViewRef?.current?.scrollTo({ y: 0, animated: false });
    onOpenStory && onOpenStory();
  };

  const [reflection, setReflection] = useState(today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(today.barnabasNote || "");
  const [receivedKindness, setReceivedKindness] = useState(today.receivedKindness || "");

  // Kept in sync every render (not via an effect) so the unmount cleanup
  // below can always read the latest typed-but-not-yet-saved text, instead
  // of the stale values it would see from an empty-dependency closure.
  const unsavedFieldsRef = useRef({ reflection, barnabasNote, receivedKindness });
  unsavedFieldsRef.current = { reflection, barnabasNote, receivedKindness };

  // Switching tabs unmounts this screen entirely (see App.js), which would
  // otherwise silently discard anything typed into the three reflection
  // fields but never explicitly saved. viewingDay itself never changes on a
  // tab switch, so saving here always lands on the correct day.
  useEffect(() => {
    return () => {
      const { reflection, barnabasNote, receivedKindness } = unsavedFieldsRef.current;
      if (reflection.trim() || barnabasNote.trim() || receivedKindness.trim()) {
        saveReflection(reflection, barnabasNote, receivedKindness);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showMomentReflectSaved, setShowMomentReflectSaved] = useState(false);
  const [showWordReflectPrompt, setShowWordReflectPrompt] = useState(false);
  const [showWordReflectSaved, setShowWordReflectSaved] = useState(false);

  // "A Word for You" / "Encouraging Thought" in Today's Reading are shown
  // as accordion rows. Each one's open/closed state defaults to whether the
  // viewed day already has content in it (or, for the moment card, whether
  // it's already done), so a returning user sees their own words
  // immediately — recomputed only when the viewed day itself changes.
  const [versePopupOpen, setVersePopupOpen] = useState(false);
  const [versePopupRef, setVersePopupRef] = useState(null);
  const [wordOpen, setWordOpen] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [momentOpen, setMomentOpen] = useState(!today.momentDone);
  // Only true for a reminder scheduled during this screen visit — mirrors
  // justCompleted below, since we don't persist "was a notification
  // scheduled" in storage, just confirm the action that was just taken.
  const [reminderScheduled, setReminderScheduled] = useState(false);

  // The viewed day's saved reflection/note only comes through on first
  // mount via useState's initial value — keep the text boxes in sync
  // whenever the user navigates to a different day.
  useEffect(() => {
    setReflection(today.reflection || "");
    setBarnabasNote(today.barnabasNote || "");
    setReceivedKindness(today.receivedKindness || "");
    setShowCustomMomentInput(false);
    setCustomMomentInput("");
    setShowWordReflectPrompt(false);
    setWordOpen(false);
    setThoughtOpen(false);
    setMomentOpen(!today.momentDone);
    setJustCompleted(false);
    setReminderScheduled(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingDay]);

  // Autosave whatever's currently typed before the viewed day changes out
  // from under it — otherwise the [viewingDay] effect above overwrites the
  // text boxes with the new day's content before the user ever taps Save.
  const handleGoToPrevDay = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    goToPrevDay();
  };
  const handleGoToNextDay = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    goToNextDay();
  };
  const handleJumpToToday = () => {
    saveReflection(reflection, barnabasNote, receivedKindness);
    jumpToToday();
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
  const confessionSaved = isFavorited("confession", viewingDay);
  const quoteSaved = isFavorited("wisdom", viewingDay);

  const [sharePreview, setSharePreview] = useState(null);

  const shareMomentText = async () => {
    const message = t("today.shareMoment", { moment, brand: t("app.brand") });
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  const reachOutToSomeone = async () => {
    // An icebreaker, not a generic line — quoting today's actual
    // encouragement gives the person something concrete to respond to
    // instead of a bare "how are you," which is easy to send but also easy
    // to leave unsent.
    const message = encouragement
      ? t("today.reachOut.messageWithQuote", { quote: truncateForPreview(encouragement, 100) })
      : t("today.reachOut.message");
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  const talkToSomeone = async () => {
    const message = t("today.reachOut.talkMessage");
    try {
      await Share.share({ message });
    } catch (e) {
      // user dismissed the share sheet — nothing to do
    }
  };

  // Jump links under the day navigator, and the refs/helper that make them
  // scroll to the right spot in App.js's shared ScrollView. Word also opens
  // its accordion row on jump, since landing on a collapsed one-liner
  // wouldn't be useful.
  const verseRef = useRef(null);
  const confessionRef = useRef(null);
  const wordRef = useRef(null);

  const scrollToRef = (ref) => {
    if (!ref.current || !scrollViewRef?.current) return;
    ref.current.measureLayout(
      scrollViewRef.current,
      (x, y) => scrollViewRef.current.scrollTo({ y: Math.max(0, y - 12), animated: true }),
      () => {}
    );
  };

  const supportBlocks = [];
  if (showCrisisNudge) {
    const crisisResource = getCrisisResource(resolveCrisisRegion(settings));
    supportBlocks.push({
      key: "crisis",
      content: (
        <>
          <Text style={styles.cardLabel}>{t("today.support.crisis.title")}</Text>
          <Text style={[styles.bodyText, { marginBottom: 10 }]}>{t("today.support.crisis.body")}</Text>
          <Text style={[styles.bodyText, { marginBottom: 14 }]}>{crisisResource.sentence}</Text>
          {crisisResource.callUrl ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Linking.openURL(crisisResource.callUrl)}
              accessibilityRole="button"
              accessibilityLabel={crisisResource.callLabel}
            >
              <Ionicons name="call-outline" size={15} color={colors.sageDark} />
              <Text style={styles.secondaryButtonText}>{crisisResource.callLabel}</Text>
            </TouchableOpacity>
          ) : null}
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
            <Text style={styles.cardLabel}>{t("today.support.checkinTalk.title")}</Text>
            <Text style={[styles.bodyText, { marginBottom: 14 }]}>{t("today.support.checkinTalk.body")}</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={talkToSomeone}
              accessibilityRole="button"
              accessibilityLabel={t("today.support.checkinTalk.talkLabel")}
            >
              <Text style={styles.secondaryButtonText}>{t("today.support.checkinTalk.talkButton")}</Text>
            </TouchableOpacity>
            {nudgeVerse ? (
              <View style={styles.nudgeVerseBox}>
                <Text style={styles.nudgeVerseLabel}>{t("today.support.savedVerseLabel")}</Text>
                <Text style={styles.nudgeVerseText}>“{nudgeVerse.text}”</Text>
                <Text style={styles.nudgeVerseRef}>— {nudgeVerse.ref}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.cardLabel}>{t("today.support.checkinPause.title")}</Text>
            <Text style={styles.bodyText}>{t("today.support.checkinPause.body")}</Text>
            {nudgeVerse ? (
              <View style={styles.nudgeVerseBox}>
                <Text style={styles.nudgeVerseLabel}>{t("today.support.savedVerseLabel")}</Text>
                <Text style={styles.nudgeVerseText}>“{nudgeVerse.text}”</Text>
                <Text style={styles.nudgeVerseRef}>— {nudgeVerse.ref}</Text>
              </View>
            ) : null}
          </>
        ),
    });
  }
  if (showCallNudge) {
    supportBlocks.push({
      key: "call",
      content: (
        <>
          <Text style={styles.cardLabel}>{t("today.support.call.title")}</Text>
          <Text style={[styles.bodyText, { marginBottom: 14 }]}>{t("today.support.call.body")}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Linking.openURL("tel:")}
            accessibilityRole="button"
            accessibilityLabel={t("today.support.call.callLabel")}
          >
            <Text style={styles.secondaryButtonText}>{t("today.support.call.callButton")}</Text>
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
            onPress={handleGoToPrevDay}
            disabled={viewingDay <= 1}
            accessibilityLabel={t("today.dayNav.previous")}
            accessibilityRole="button"
          >
            <Text style={styles.dayNavBtnText} maxFontSizeMultiplier={1.3}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dayNavLabel}>
            {isToday
              ? t("today.dayNav.todayLabel", { day: viewingDay })
              : t("today.dayNav.dayLabel", { day: viewingDay })}
          </Text>
          <TouchableOpacity
            style={[styles.dayNavBtn, viewingDay >= latestDay && styles.dayNavBtnDisabled]}
            onPress={handleGoToNextDay}
            disabled={viewingDay >= latestDay}
            accessibilityLabel={t("today.dayNav.next")}
            accessibilityRole="button"
          >
            <Text style={styles.dayNavBtnText} maxFontSizeMultiplier={1.3}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dayProgressWrap}>
          <Text style={styles.dayProgressLabel}>
            {t("today.dayNav.progress", { day: latestDay, total: TOTAL_DAYS })}
          </Text>
          <View style={styles.dayProgressTrack}>
            <View
              style={[
                styles.dayProgressFill,
                { width: `${Math.min(100, Math.round((latestDay / TOTAL_DAYS) * 100))}%` },
              ]}
            />
          </View>
        </View>
        {!isToday ? (
          <TouchableOpacity onPress={handleJumpToToday} accessibilityRole="button" accessibilityLabel={t("today.dayNav.backToToday")}>
            <Text style={styles.dayNavJump}>{t("today.dayNav.backToToday")}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.jumpRow} accessibilityRole="none">
        <TouchableOpacity
          onPress={() => scrollToRef(verseRef)}
          accessibilityRole="button"
          accessibilityLabel={t("today.jump.verseLabel")}
        >
          <Text style={styles.jumpLink}>{t("today.jump.verse")}</Text>
        </TouchableOpacity>
        <Text style={styles.jumpDot}>·</Text>
        <TouchableOpacity
          onPress={() => scrollToRef(confessionRef)}
          accessibilityRole="button"
          accessibilityLabel={t("today.jump.confessionLabel")}
        >
          <Text style={styles.jumpLink}>{t("today.jump.confession")}</Text>
        </TouchableOpacity>
        <Text style={styles.jumpDot}>·</Text>
        <TouchableOpacity
          onPress={() => {
            setWordOpen(true);
            scrollToRef(wordRef);
          }}
          accessibilityRole="button"
          accessibilityLabel={t("today.jump.wordLabel")}
        >
          <Text style={styles.jumpLink}>{t("today.jump.word")}</Text>
        </TouchableOpacity>
      </View>

      {/* Your Barnabas Moment: the app's centerpiece action, so it leads the
          screen rather than sitting among the reading sections below. It
          collapses to a one-line summary once it's done, unless yesterday's
          follow-up question is still pending. */}
      <View style={styles.sectionGroup}>
        <View style={styles.heroSectionGroupHeader}>
          <View style={styles.heroTitleWrap}>
            <Ionicons name="sparkles" size={18} color={colors.goldText} />
            <Text style={styles.heroSectionTitle}>{t("today.moment.sectionTitle")}</Text>
          </View>
          {streak > 1 ? (
            <View
              style={[styles.streakChip, styles.streakChipRow]}
              accessibilityLabel={t("today.moment.streakChipLabel", { count: streak })}
            >
              <Ionicons name="flame" size={13} color={colors.sageDark} />
              <Text style={styles.streakChipText}>{streak}</Text>
            </View>
          ) : null}
        </View>
        {momentsDone > 0 ? (
          <Text style={styles.heroTallyText}>
            {t("today.moment.tally", { times: t("rewards.units.time", { count: momentsDone }) })}
          </Text>
        ) : null}
        {nextMilestone ? (
          <Text style={styles.milestoneTeaser}>
            {nextMilestone.type === "streak"
              ? t("today.moment.milestoneStreak", { count: nextMilestone.remaining })
              : t("today.moment.milestoneStars", { count: nextMilestone.remaining })}
          </Text>
        ) : null}
        {canCollapseMoment && !momentOpen ? (
          <TouchableOpacity
            style={styles.momentSummaryCard}
            onPress={() => {
              hapticTap();
              setMomentOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("today.moment.summaryLabel")}
          >
            <Text style={styles.momentSummaryText}>{t("today.moment.summaryText")}</Text>
            <Text style={styles.accordionChevron}>›</Text>
          </TouchableOpacity>
        ) : (
          <Card style={[styles.momentCard, styles.heroMomentCard]}>
            {showMomentFollowUp ? (
              <View style={styles.followUpStrip}>
                <Text style={styles.followUpStripLabel}>{t("today.moment.followUp.label")}</Text>
                <Text style={[styles.followUpStripText, { marginBottom: 12 }]}>{prevMoment}</Text>
                <Text style={styles.followUpQuestion}>{t("today.moment.followUp.question")}</Text>
                <View style={styles.followUpActions}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleFollowUp("done")}
                    accessibilityRole="button"
                    accessibilityLabel={t("today.moment.followUp.yesLabel")}
                  >
                    <Text style={styles.buttonText}>{t("today.moment.followUp.yesButton")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.followUpBtn}
                    onPress={() => handleFollowUp("not_yet")}
                    accessibilityRole="button"
                    accessibilityLabel={t("today.moment.followUp.notYet")}
                  >
                    <Text style={styles.followUpBtnText}>{t("today.moment.followUp.notYet")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.followUpBtn}
                    onPress={() => handleFollowUp("no")}
                    accessibilityRole="button"
                    accessibilityLabel={t("today.moment.followUp.no")}
                  >
                    <Text style={styles.followUpBtnText}>{t("today.moment.followUp.no")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {canCollapseMoment ? (
              <TouchableOpacity
                style={styles.collapseLinkWrap}
                onPress={() => {
                  hapticTap();
                  setMomentOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={t("today.moment.collapseLabel")}
              >
                <Text style={styles.collapseLink}>{t("today.moment.collapseText")}</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={[styles.bodyText, { marginBottom: 14 }]}>{moment}</Text>

            {!today.momentDone && story ? (
              <TouchableOpacity
                style={styles.storyTieInRow}
                onPress={handleReadStory}
                accessibilityRole="button"
                accessibilityLabel={`${t("today.moment.inspiredByLabel")} ${story.title}`}
              >
                <Text style={styles.storyTieInText}>
                  {t("today.moment.inspiredByLabel")} <Text style={styles.storyTieInTitle}>{story.title}</Text>
                </Text>
                <Text style={styles.storyTieInLink}>{t("today.moment.readStoryLink")}</Text>
              </TouchableOpacity>
            ) : null}

            {!today.momentDone ? (
              today.customMoment ? (
                <View style={styles.customMomentRow}>
                  <Text style={styles.customMomentNote}>{t("today.moment.customNote")}</Text>
                  <TouchableOpacity
                    onPress={handleUseSuggestion}
                    accessibilityRole="button"
                    accessibilityLabel={t("today.moment.useSuggestion")}
                  >
                    <Text style={styles.intentionChange}>{t("today.moment.useSuggestion")}</Text>
                  </TouchableOpacity>
                </View>
              ) : showCustomMomentInput ? (
                <View style={styles.customMomentPrompt}>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={2}
                    placeholder={t("today.moment.customPlaceholder")}
                    placeholderTextColor={colors.textSoft}
                    value={customMomentInput}
                    onChangeText={setCustomMomentInput}
                  />
                  <View style={styles.customMomentBtnRow}>
                    <TouchableOpacity
                      style={styles.momentReflectSaveBtn}
                      onPress={handleUseCustomMoment}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.moment.useCustom")}
                    >
                      <Text style={styles.momentReflectSaveBtnText}>{t("today.moment.useCustom")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowCustomMomentInput(false)}
                      accessibilityRole="button"
                      accessibilityLabel={t("common.cancel")}
                    >
                      <Text style={styles.intentionChange}>{t("common.cancel")}</Text>
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
                  accessibilityRole="button"
                  accessibilityLabel={t("today.moment.writeOwn")}
                >
                  <Text style={styles.customMomentLink}>{t("today.moment.writeOwn")}</Text>
                </TouchableOpacity>
              )
            ) : null}

            {isToday && !today.momentDone ? (
              today.momentIntention ? (
                <View style={styles.intentionPrompt}>
                  <View style={[styles.intentionRow, reminderScheduled && { marginBottom: 4 }]}>
                    <Text style={styles.intentionText}>
                      {t("today.moment.plannedFor", { when: MOMENT_INTENTION_LABELS[today.momentIntention] })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setMomentIntention(null);
                        cancelMomentReminder();
                        setReminderScheduled(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.moment.changeWhenLabel")}
                    >
                      <Text style={styles.intentionChange}>{t("common.change")}</Text>
                    </TouchableOpacity>
                  </View>
                  {reminderScheduled ? (
                    <Text style={styles.reminderScheduledText}>{t("today.moment.reminderOn")}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.intentionPrompt}>
                  <Text style={styles.intentionPromptLabel}>{t("today.moment.whenPrompt")}</Text>
                  <View style={styles.intentionOptions}>
                    {MOMENT_INTENTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.key}
                        style={styles.intentionBtn}
                        onPress={async () => {
                          hapticTap();
                          setMomentIntention(opt.key);
                          const ok = await scheduleMomentReminder(opt.key, moment);
                          setReminderScheduled(ok);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={opt.label}
                      >
                        <Text style={styles.intentionBtnText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )
            ) : null}

            {!today.momentDone ? (
              <Text style={styles.rewardHint}>
                {t("today.moment.rewardHint", { stars: MOMENT_STAR_REWARD })}
              </Text>
            ) : null}

            <View style={styles.momentActions}>
              <TouchableOpacity
                style={[styles.button, today.momentDone && styles.buttonDisabled]}
                onPress={handleMarkDone}
                disabled={today.momentDone}
                accessibilityRole="button"
                accessibilityLabel={
                  today.momentDone
                    ? t("today.moment.doneLabel")
                    : isToday
                    ? t("today.moment.doTodayLabel")
                    : t("today.moment.doLabel")
                }
                accessibilityState={{ disabled: today.momentDone }}
              >
                <Text style={styles.buttonText}>
                  {today.momentDone
                    ? t("today.moment.doneText")
                    : isToday
                    ? t("today.moment.doTodayText")
                    : t("today.moment.doText")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={shareMomentText}
                accessibilityRole="button"
                accessibilityLabel={t("today.moment.sendToSomeone")}
              >
                <Text style={styles.secondaryButtonText}>{t("today.moment.sendToSomeone")}</Text>
              </TouchableOpacity>
            </View>
            {today.momentDone ? (
              <>
                {justCompleted ? (
                  <Animated.View
                    style={[
                      styles.celebrateBox,
                      {
                        opacity: celebrateAnim,
                        transform: [
                          { scale: celebrateAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.celebrateText}>
                      {t("today.moment.celebrateMsg", { stars: MOMENT_STAR_REWARD, streak })}
                    </Text>
                  </Animated.View>
                ) : (
                  <Text style={styles.doneMsg}>{t("today.moment.doneMsg")}</Text>
                )}
                {!today.barnabasNote ? (
                  <View style={styles.momentReflectPrompt}>
                    <Text style={styles.momentReflectLabel}>{t("today.moment.whatHappenedLabel")}</Text>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={2}
                      placeholder={t("today.moment.whatHappenedPlaceholder")}
                      placeholderTextColor={colors.textSoft}
                      value={barnabasNote}
                      onChangeText={setBarnabasNote}
                    />
                    <TouchableOpacity
                      style={styles.momentReflectSaveBtn}
                      onPress={handleMomentReflectSave}
                      accessibilityRole="button"
                      accessibilityLabel={t("common.saveShort")}
                    >
                      <Text style={styles.momentReflectSaveBtnText}>{t("common.saveShort")}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {showMomentReflectSaved ? (
                  <Text style={styles.momentReflectSavedMsg}>{t("today.moment.reflectSaved")}</Text>
                ) : null}
              </>
            ) : null}

            <View style={styles.reachOutInline}>
              <Text style={styles.reachOutInlineText}>{t("today.moment.reachOutPrefix")}</Text>
              <TouchableOpacity
                onPress={reachOutToSomeone}
                accessibilityRole="button"
                accessibilityLabel={t("today.moment.reachOutLink")}
              >
                <Text style={styles.reachOutInlineLink}>{t("today.moment.reachOutLink")}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      {/* Today's Reading: Verse stays open as the anchor; A Word for You and
          Encouraging Thought collapse to a one-line preview. */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Ionicons name="book-outline" size={16} color={colors.sageDark} />
          <Text style={styles.sectionGroupTitle}>{t("today.reading.sectionTitle")}</Text>
        </View>

        <View ref={verseRef} collapsable={false} style={[styles.unifiedCard, styles.readingCard]}>
          <View style={styles.unifiedBlock}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>{t("today.labels.verse")}</Text>
              <ActionMenu
                actions={[
                  { label: t("common.listen"), onPress: () => speak(`${verse.text} — ${verse.ref}`, settings) },
                  {
                    label: t("common.share"),
                    onPress: () =>
                      setSharePreview({ text: verse.text, sourceLine: `${verse.ref} (${verse.version})` }),
                  },
                  {
                    label: verseSaved ? t("common.savedTapRemove") : t("common.save"),
                    active: verseSaved,
                    onPress: () =>
                      toggleFavorite("verse", viewingDay, { text: verse.text, ref: `${verse.ref} (${verse.version})` }),
                  },
                ]}
              />
            </View>
            <Text style={styles.verseText}>“{verse.text}”</Text>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                setVersePopupRef(verse.ref);
                setVersePopupOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t("today.confession.viewVerseLabel", { ref: verse.ref })}
            >
              <Text style={[styles.verseRef, styles.confessionRefLink]}>{verse.ref} ({verse.version})</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shown in full, never collapsed behind a tap — unlike the Word/
            Thought accordions below. A confession only does its job if it's
            actually spoken, and a truncated preview behind a chevron is too
            easy to skim past without ever reaching the "speak it aloud"
            prompt at the bottom. */}
        <View ref={confessionRef} collapsable={false} style={[styles.unifiedCard, styles.readingCard]}>
          <View style={styles.unifiedBlock}>
            <View style={styles.cardLabelRow}>
              <View style={[styles.accordionRowTitleWrap, { flex: 0 }]}>
                <Ionicons name="megaphone-outline" size={16} color={colors.sageDark} />
                <Text style={[styles.cardLabel, { marginBottom: 0 }]}>{t("today.confession.title")}</Text>
              </View>
              <ActionMenu
                actions={[
                  {
                    label: t("common.listen"),
                    onPress: () => speak(`${confession.text} — ${confession.ref}`, settings),
                  },
                  {
                    label: t("common.share"),
                    onPress: () => setSharePreview({ text: confession.text, sourceLine: confession.ref }),
                  },
                  {
                    label: confessionSaved ? t("common.savedTapRemove") : t("common.save"),
                    active: confessionSaved,
                    onPress: () =>
                      toggleFavorite("confession", viewingDay, { text: confession.text, ref: confession.ref }),
                  },
                ]}
              />
            </View>
            <Text style={styles.bodyText}>{confession.text}</Text>
            <TouchableOpacity
              onPress={() => {
                hapticTap();
                setVersePopupRef(confession.ref);
                setVersePopupOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t("today.confession.viewVerseLabel", { ref: confession.ref })}
            >
              <Text style={[styles.wisdomSource, styles.confessionRefLink]}>— {confession.ref}</Text>
            </TouchableOpacity>
            <Text style={styles.confessionSpeakPrompt}>{t("today.confession.speakPrompt")}</Text>
          </View>
        </View>

        <View ref={wordRef} collapsable={false} style={styles.accordionRow}>
          <TouchableOpacity
            style={styles.accordionRowHead}
            onPress={() => {
              hapticTap();
              setWordOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("today.word.title")}
            accessibilityState={{ expanded: wordOpen }}
          >
            <View style={styles.accordionRowTitleWrap}>
              <Ionicons name="heart" size={16} color={colors.goldText} />
              <Text style={styles.accordionRowTitle}>{t("today.word.title")}</Text>
            </View>
            <Text style={[styles.accordionChevron, wordOpen && styles.accordionChevronOpen]}>›</Text>
          </TouchableOpacity>
          {!wordOpen ? (
            <Text style={styles.accordionPreview}>{truncateForPreview(encouragement)}</Text>
          ) : (
            <View style={styles.accordionRowBody}>
              <View style={styles.accordionActionRow}>
                <ActionMenu
                  actions={[
                    { label: t("common.listen"), onPress: () => speak(encouragement, settings) },
                    {
                      label: t("common.share"),
                      onPress: () => setSharePreview({ text: encouragement, sourceLine: t("today.word.title") }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.bodyText}>{encouragement}</Text>

              {!today.reflection ? (
                showWordReflectPrompt ? (
                  <View style={styles.customMomentPrompt}>
                    <TextInput
                      style={[styles.textArea, { marginTop: 12 }]}
                      multiline
                      numberOfLines={2}
                      placeholder={t("today.word.reflectPlaceholderWithQuote", {
                        quote: truncateForPreview(encouragement, 60),
                      })}
                      placeholderTextColor={colors.textSoft}
                      value={reflection}
                      onChangeText={setReflection}
                    />
                    <View style={styles.customMomentBtnRow}>
                      <TouchableOpacity
                        style={styles.momentReflectSaveBtn}
                        onPress={handleWordReflectSave}
                        accessibilityRole="button"
                        accessibilityLabel={t("today.reflect.saveLabel")}
                      >
                        <Text style={styles.momentReflectSaveBtnText}>{t("common.saveShort")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowWordReflectPrompt(false)}
                        accessibilityRole="button"
                        accessibilityLabel={t("common.cancel")}
                      >
                        <Text style={styles.intentionChange}>{t("common.cancel")}</Text>
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
                    accessibilityRole="button"
                    accessibilityLabel={t("today.word.reflectPrompt")}
                  >
                    <Text style={styles.customMomentLink}>{t("today.word.reflectPrompt")}</Text>
                  </TouchableOpacity>
                )
              ) : null}
              {showWordReflectSaved ? (
                <Text style={[styles.momentReflectSavedMsg, { marginTop: 12 }]}>{t("today.word.reflectSaved")}</Text>
              ) : null}
            </View>
          )}
        </View>

        <View style={styles.accordionRow}>
          <TouchableOpacity
            style={styles.accordionRowHead}
            onPress={() => {
              hapticTap();
              setThoughtOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("today.thought.title")}
            accessibilityState={{ expanded: thoughtOpen }}
          >
            <View style={styles.accordionRowTitleWrap}>
              <Ionicons name="sparkles-outline" size={16} color={colors.text} />
              <Text style={styles.accordionRowTitle}>{t("today.thought.title")}</Text>
            </View>
            <Text style={[styles.accordionChevron, thoughtOpen && styles.accordionChevronOpen]}>›</Text>
          </TouchableOpacity>
          {!thoughtOpen ? (
            <Text style={styles.accordionPreview}>{truncateForPreview(quote.text)}</Text>
          ) : (
            <View style={styles.accordionRowBody}>
              <View style={styles.accordionActionRow}>
                <ActionMenu
                  actions={[
                    {
                      label: t("common.share"),
                      onPress: () => setSharePreview({ text: quote.text, sourceLine: `— ${quote.source || ""}` }),
                    },
                    {
                      label: quoteSaved ? t("common.savedTapRemove") : t("common.save"),
                      active: quoteSaved,
                      onPress: () =>
                        toggleFavorite("wisdom", viewingDay, { text: quote.text, source: quote.source || "" }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.bodyText}>“{quote.text}”</Text>
              <Text style={styles.wisdomSource}>— {quote.source}</Text>
            </View>
          )}
        </View>
      </View>

      {/* A Little Extra Support: call nudge / check-in nudge / crisis resource unified into one card */}
      {showSupportSection ? (
        <View style={styles.sectionGroup}>
          <View style={styles.sectionGroupHeader}>
            <Ionicons name="chatbubbles-outline" size={16} color={colors.sageDark} />
            <Text style={styles.sectionGroupTitle}>{t("today.support.sectionTitle")}</Text>
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
        reflectionText={today.reflection || ""}
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setSharePreview(null)}
      />

      <VersePopup visible={versePopupOpen} scriptureRef={versePopupRef} onClose={() => setVersePopupOpen(false)} />

      {/* Reflection now lives in the Journal tab — this is just a nudge,
          not the form itself. Tapping it opens the same dedicated editor
          screen Journal's own entries open, scoped to whichever day this
          screen is currently viewing. */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Ionicons name="create-outline" size={16} color={colors.sageDark} />
          <Text style={styles.sectionGroupTitle}>
            {isToday
              ? t("today.reflect.sectionTitleToday")
              : t("today.reflect.sectionTitleDay", { day: viewingDay })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            hapticTap();
            onOpenReflection(viewingDay);
          }}
          accessibilityRole="button"
          accessibilityLabel={t("today.reflect.teaserLabel")}
        >
          <Card>
            <View style={styles.reflectTeaserRow}>
              <View style={styles.reflectTeaserLeft}>
                <Ionicons name="heart" size={20} color={colors.goldText} />
                <Text style={styles.reflectTeaserText} numberOfLines={2}>
                  {today.reflection || today.barnabasNote || today.receivedKindness
                    ? truncateForPreview(today.reflection || today.barnabasNote || today.receivedKindness)
                    : t("today.reflect.teaserEmpty")}
                </Text>
              </View>
              <Text style={styles.reflectTeaserArrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    dayNav: {
      alignItems: "center",
      marginBottom: 10,
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
      backgroundColor: colors.sage,
      alignItems: "center",
      justifyContent: "center",
    },
    dayNavBtnDisabled: { opacity: 0.35 },
    dayNavBtnText: { fontSize: 18, fontWeight: "700", color: colors.card },
    dayNavLabel: { fontWeight: "700", fontSize: 14, color: colors.sageDark, minWidth: 110, textAlign: "center" },
    dayNavJump: { fontSize: 12, fontWeight: "700", color: colors.sky, textDecorationLine: "underline" },
    dayProgressWrap: { width: "60%", maxWidth: 220, alignItems: "center" },
    dayProgressLabel: { fontSize: 11, fontWeight: "600", color: colors.textSoft, marginBottom: 4 },
    dayProgressTrack: {
      width: "100%",
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      overflow: "hidden",
    },
    dayProgressFill: { height: "100%", borderRadius: 2, backgroundColor: colors.sage },
    jumpRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    jumpLink: { fontSize: 12, fontWeight: "700", color: colors.sageDark },
    jumpDot: { fontSize: 12, color: colors.textSoft },
    sectionGroup: { marginBottom: 6 },
    sectionGroupHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
      marginLeft: 2,
    },
    sectionGroupTitle: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    unifiedCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 10,
    },
    readingCard: { backgroundColor: colors.verseCard },
    supportCard: { backgroundColor: colors.reachOutCard },
    unifiedBlock: { padding: 16 },
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
    heroMomentCard: {
      borderLeftWidth: 5,
      borderLeftColor: colors.gold,
    },
    heroSectionGroupHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      marginLeft: 2,
    },
    heroTitleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
    heroSectionTitle: { fontSize: 18, fontWeight: "800", color: colors.sageDark },
    heroTallyText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.sageDark,
      marginBottom: 10,
      marginLeft: 2,
    },
    milestoneTeaser: {
      fontSize: 12.5,
      fontWeight: "600",
      color: colors.goldText,
      marginBottom: 10,
      marginLeft: 2,
    },
    streakChip: {
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    streakChipRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    streakChipText: { fontSize: 12.5, fontWeight: "700", color: colors.sageDark },
    storyTieInRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 6,
      marginBottom: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    storyTieInText: { fontSize: 13, color: colors.textSoft, flexShrink: 1 },
    storyTieInTitle: { fontWeight: "700", color: colors.text },
    storyTieInLink: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.goldText,
    },
    rewardHint: {
      fontSize: 12.5,
      fontWeight: "600",
      color: colors.goldText,
      marginBottom: 10,
    },
    celebrateBox: {
      marginTop: 2,
      marginBottom: 4,
    },
    celebrateText: {
      fontSize: 15,
      color: colors.goldText,
      fontWeight: "700",
    },
    momentSummaryCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.momentCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    momentSummaryText: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    collapseLinkWrap: { alignSelf: "flex-end", marginBottom: 8 },
    collapseLink: { fontSize: 12, fontWeight: "700", color: colors.textSoft },
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
      fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
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
    confessionRefLink: {
      color: colors.sageDark,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    confessionSpeakPrompt: {
      marginTop: 10,
      fontSize: 12.5,
      color: colors.textSoft,
      fontStyle: "italic",
    },
    button: {
      backgroundColor: colors.buttonBg,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 18,
      alignItems: "center",
    },
    buttonDisabled: { opacity: 0.55 },
    buttonText: { color: colors.buttonOnText, fontWeight: "700", fontSize: 14 },
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
    reminderScheduledText: { fontSize: 12, color: colors.textSoft },
    intentionChange: { fontSize: 12, color: colors.textSoft, textDecorationLine: "underline" },
    secondaryButton: {
      flexDirection: "row",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.sage,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: { color: colors.sageDark, fontWeight: "700", fontSize: 13 },
    nudgeVerseBox: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    nudgeVerseLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontSize: 10.5,
      fontWeight: "700",
      color: colors.sageDark,
      marginBottom: 6,
    },
    nudgeVerseText: { fontSize: 14, lineHeight: 20, color: colors.text, fontStyle: "italic" },
    nudgeVerseRef: { marginTop: 4, fontSize: 12.5, color: colors.textSoft, textAlign: "right" },
    doneMsg: {
      marginTop: 10,
      fontSize: 14,
      color: colors.sageDark,
      fontWeight: "600",
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
    accordionRowTitle: { flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text },
    accordionChevron: { fontSize: 16, color: colors.textSoft },
    accordionChevronOpen: { transform: [{ rotate: "90deg" }] },
    accordionRowBody: { paddingHorizontal: 13, paddingBottom: 13 },
    accordionActionBtn: { alignSelf: "flex-end", marginBottom: 6 },
    accordionActionRow: { alignItems: "flex-end", marginBottom: 6 },
    accordionPreview: {
      fontSize: 12.5,
      color: colors.textSoft,
      fontStyle: "italic",
      paddingHorizontal: 13,
      paddingBottom: 13,
      marginTop: -6,
    },
    reflectTeaserRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    reflectTeaserLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    reflectTeaserText: { flex: 1, fontSize: 13.5, fontWeight: "600", color: colors.text },
    reflectTeaserArrow: { fontSize: 20, color: colors.sage, fontWeight: "700" },
  });
}
