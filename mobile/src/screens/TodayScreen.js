import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import ActionMenu from "../components/ActionMenu";
import SharePreviewModal from "../components/SharePreviewModal";
import { useTheme } from "../theme";
import { getCrisisResource, resolveCrisisRegion } from "../crisisResources";
import { pickForDay, pickForDaySmallBank, pickVerseVersion } from "../content";
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
import { speak } from "../speech";
import { hapticSuccess, hapticTap } from "../haptics";

// The "Encouraging Thought" card is quotes-only now (true stories moved to
// their own Story tab, backed by data/stories.js; facts moved to their own
// Facts tab, backed by data/highlights.js). WISDOM still holds legacy
// "story"-type entries alongside quotes; filter down to just quotes.
const QUOTES = WISDOM.filter((w) => w.type === "quote");

const MOOD_KEYS = [
  { key: "joyful", emoji: "😊" },
  { key: "peaceful", emoji: "🙂" },
  { key: "hopeful", emoji: "🌱" },
  { key: "tired", emoji: "😔" },
  { key: "struggling", emoji: "😢" },
];

const MOMENT_INTENTION_KEYS = ["today", "tonight", "tomorrow"];

const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);

function truncateForPreview(text) {
  const trimmed = text.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90).trimEnd()}…` : trimmed;
}

const ENCOURAGEMENTS_BY_LANG = { es: ENCOURAGEMENTS_ES, pt: ENCOURAGEMENTS_PT, fr: ENCOURAGEMENTS_FR };
const BARNABAS_MOMENTS_BY_LANG = { es: BARNABAS_MOMENTS_ES, pt: BARNABAS_MOMENTS_PT, fr: BARNABAS_MOMENTS_FR };
const QUOTES_BY_LANG = { es: QUOTES_ES, pt: QUOTES_PT, fr: QUOTES_FR };

export default function TodayScreen({ store, scrollViewRef }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t, i18n } = useTranslation();
  const encouragementsBank = ENCOURAGEMENTS_BY_LANG[i18n.language] || ENCOURAGEMENTS;
  const momentsBank = BARNABAS_MOMENTS_BY_LANG[i18n.language] || BARNABAS_MOMENTS;
  const quotesBank = QUOTES_BY_LANG[i18n.language] || QUOTES;

  const MOODS = MOOD_KEYS.map((m) => ({ ...m, label: t(`common.moods.${m.key}`) }));
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

  const [reflection, setReflection] = useState(today.reflection || "");
  const [barnabasNote, setBarnabasNote] = useState(today.barnabasNote || "");
  const [receivedKindness, setReceivedKindness] = useState(today.receivedKindness || "");
  const [showSaved, setShowSaved] = useState(false);
  const [showMomentReflectSaved, setShowMomentReflectSaved] = useState(false);
  const [showWordReflectPrompt, setShowWordReflectPrompt] = useState(false);
  const [showWordReflectSaved, setShowWordReflectSaved] = useState(false);

  // The three "Reflect on Today" fields, and "A Word for You" / "Encouraging
  // Thought" in Today's Reading, are all shown as accordion rows. Each one's
  // open/closed state defaults to whether the viewed day already has
  // content in it (or, for the moment card, whether it's already done), so
  // a returning user sees their own words immediately — recomputed only
  // when the viewed day itself changes.
  const [heartOpen, setHeartOpen] = useState(Boolean(today.reflection));
  const [barnabasOpen, setBarnabasOpen] = useState(Boolean(today.barnabasNote));
  const [kindnessOpen, setKindnessOpen] = useState(Boolean(today.receivedKindness));
  const [confessionOpen, setConfessionOpen] = useState(false);
  const [wordOpen, setWordOpen] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [momentOpen, setMomentOpen] = useState(!today.momentDone);

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
    setConfessionOpen(false);
    setWordOpen(false);
    setThoughtOpen(false);
    setMomentOpen(!today.momentDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const message = t("today.reachOut.message");
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
  const momentSectionRef = useRef(null);
  const reflectRef = useRef(null);

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
              <Text style={styles.secondaryButtonText}>📞 {crisisResource.callLabel}</Text>
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
          </>
        ) : (
          <>
            <Text style={styles.cardLabel}>{t("today.support.checkinPause.title")}</Text>
            <Text style={styles.bodyText}>{t("today.support.checkinPause.body")}</Text>
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
            onPress={goToPrevDay}
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
            onPress={goToNextDay}
            disabled={viewingDay >= latestDay}
            accessibilityLabel={t("today.dayNav.next")}
            accessibilityRole="button"
          >
            <Text style={styles.dayNavBtnText} maxFontSizeMultiplier={1.3}>›</Text>
          </TouchableOpacity>
        </View>
        {!isToday ? (
          <TouchableOpacity onPress={jumpToToday} accessibilityRole="button" accessibilityLabel={t("today.dayNav.backToToday")}>
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
          onPress={() => {
            setConfessionOpen(true);
            scrollToRef(confessionRef);
          }}
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
        <Text style={styles.jumpDot}>·</Text>
        <TouchableOpacity
          onPress={() => scrollToRef(momentSectionRef)}
          accessibilityRole="button"
          accessibilityLabel={t("today.jump.momentLabel")}
        >
          <Text style={styles.jumpLink}>{t("today.jump.moment")}</Text>
        </TouchableOpacity>
        <Text style={styles.jumpDot}>·</Text>
        <TouchableOpacity
          onPress={() => scrollToRef(reflectRef)}
          accessibilityRole="button"
          accessibilityLabel={t("today.jump.reflectLabel")}
        >
          <Text style={styles.jumpLink}>{t("today.jump.reflect")}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Reading: Verse stays open as the anchor; A Word for You and
          Encouraging Thought collapse to a one-line preview, the same
          accordion pattern Today's Reflection already uses below. */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>📖</Text>
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
            <Text style={styles.verseRef}>{verse.ref} ({verse.version})</Text>
          </View>
        </View>

        <View ref={confessionRef} collapsable={false} style={styles.accordionRow}>
          <TouchableOpacity
            style={styles.accordionRowHead}
            onPress={() => {
              hapticTap();
              setConfessionOpen((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel={t("today.confession.title")}
            accessibilityState={{ expanded: confessionOpen }}
          >
            <View style={styles.accordionRowTitleWrap}>
              <Text style={styles.accordionEmoji}>🗣️</Text>
              <Text style={styles.accordionRowTitle}>{t("today.confession.title")}</Text>
            </View>
            <Text style={[styles.accordionChevron, confessionOpen && styles.accordionChevronOpen]}>›</Text>
          </TouchableOpacity>
          {!confessionOpen ? (
            <Text style={styles.accordionPreview}>{truncateForPreview(confession.text)}</Text>
          ) : (
            <View style={styles.accordionRowBody}>
              <View style={styles.accordionActionRow}>
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
              <Text style={styles.wisdomSource}>— {confession.ref}</Text>
              <Text style={styles.accordionPreview}>{t("today.confession.speakPrompt")}</Text>
            </View>
          )}
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
              <Text style={styles.accordionEmoji}>💛</Text>
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
                      placeholder={t("today.word.reflectPlaceholder")}
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
              <Text style={styles.accordionEmoji}>✨</Text>
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

      {/* Your Barnabas Moment: collapses to a one-line summary once it's
          done, unless yesterday's follow-up question is still pending. */}
      <View style={styles.sectionGroup}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>🤝</Text>
          <Text style={styles.sectionGroupTitle}>{t("today.moment.sectionTitle")}</Text>
        </View>
        <View ref={momentSectionRef} collapsable={false}>
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
            <Card style={styles.momentCard}>
              {showMomentFollowUp ? (
                <View style={styles.followUpStrip}>
                  <Text style={styles.followUpStripLabel}>{t("today.moment.followUp.label")}</Text>
                  <Text style={[styles.followUpStripText, { marginBottom: 12 }]}>{prevMoment}</Text>
                  <Text style={styles.followUpQuestion}>{t("today.moment.followUp.question")}</Text>
                  <View style={styles.followUpActions}>
                    <TouchableOpacity
                      style={styles.followUpBtn}
                      onPress={() => handleFollowUp("done")}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.moment.followUp.yesLabel")}
                    >
                      <Text style={styles.followUpBtnText}>{t("today.moment.followUp.yesButton")}</Text>
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
                  <View style={styles.intentionRow}>
                    <Text style={styles.intentionText}>
                      {t("today.moment.plannedFor", { when: MOMENT_INTENTION_LABELS[today.momentIntention] })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setMomentIntention(null)}
                      accessibilityRole="button"
                      accessibilityLabel={t("today.moment.changeWhenLabel")}
                    >
                      <Text style={styles.intentionChange}>{t("common.change")}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.intentionPrompt}>
                    <Text style={styles.intentionPromptLabel}>{t("today.moment.whenPrompt")}</Text>
                    <View style={styles.intentionOptions}>
                      {MOMENT_INTENTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.key}
                          style={styles.intentionBtn}
                          onPress={() => {
                            hapticTap();
                            setMomentIntention(opt.key);
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

              <View style={styles.momentActions}>
                <TouchableOpacity
                  style={[styles.button, today.momentDone && styles.buttonDisabled]}
                  onPress={() => {
                    hapticSuccess();
                    markMomentDone();
                  }}
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
                  <Text style={styles.doneMsg}>{t("today.moment.doneMsg")}</Text>
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
      </View>

      {/* A Little Extra Support: call nudge / check-in nudge / crisis resource unified into one card */}
      {showSupportSection ? (
        <View style={styles.sectionGroup}>
          <View style={styles.sectionGroupHeader}>
            <Text style={styles.sectionGroupIcon}>💬</Text>
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
        initialThemeId={settings.shareTheme}
        onThemeChange={(id) => updateSettings({ shareTheme: id })}
        onClose={() => setSharePreview(null)}
      />

      {/* Reflect on Today: three journal fields as accordion rows */}
      <View style={styles.sectionGroup} ref={reflectRef} collapsable={false}>
        <View style={styles.sectionGroupHeader}>
          <Text style={styles.sectionGroupIcon}>📝</Text>
          <Text style={styles.sectionGroupTitle}>
            {isToday
              ? t("today.reflect.sectionTitleToday")
              : t("today.reflect.sectionTitleDay", { day: viewingDay })}
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
              accessibilityRole="button"
              accessibilityLabel={t("today.reflect.heartTitle")}
              accessibilityState={{ expanded: heartOpen }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>💭</Text>
                <Text style={styles.accordionRowTitle}>{t("today.reflect.heartTitle")}</Text>
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
                  placeholder={t("today.reflect.heartPlaceholder")}
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
              accessibilityRole="button"
              accessibilityLabel={t("today.reflect.momentTitle")}
              accessibilityState={{ expanded: barnabasOpen }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>🤝</Text>
                <Text style={styles.accordionRowTitle}>{t("today.reflect.momentTitle")}</Text>
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
                  placeholder={t("today.reflect.momentPlaceholder")}
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
              accessibilityRole="button"
              accessibilityLabel={t("today.reflect.kindnessTitle")}
              accessibilityState={{ expanded: kindnessOpen }}
            >
              <View style={styles.accordionRowTitleWrap}>
                <Text style={styles.accordionEmoji}>💛</Text>
                <Text style={styles.accordionRowTitle}>{t("today.reflect.kindnessTitle")}</Text>
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
                  placeholder={t("today.reflect.kindnessPlaceholder")}
                  placeholderTextColor={colors.textSoft}
                  value={receivedKindness}
                  onChangeText={setReceivedKindness}
                />
              </View>
            ) : null}
          </View>

          <Text style={styles.fieldLabel}>{t("today.reflect.moodLabel")}</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moodBtn, today.mood === m.key && styles.moodBtnSelected]}
                onPress={() => {
                  hapticTap();
                  setMood(m.key);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: today.mood === m.key }}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { marginTop: 16 }]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={t("today.reflect.saveLabel")}
          >
            <Text style={styles.buttonText}>{t("today.reflect.saveButton")}</Text>
          </TouchableOpacity>
          {showSaved ? (
            <Text style={styles.doneMsg}>
              {isToday ? t("today.reflect.savedToday") : t("today.reflect.savedPastDay")}
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
    sectionGroupIcon: { fontSize: 15 },
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
