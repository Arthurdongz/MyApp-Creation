// Bible reading plans, reached from the same ☰ menu group as the full
// Bible browser and saved highlights — not the bottom tab bar — since
// these are all "ways into the Bible," not daily journal content. Three
// kinds of plan:
//   - "Whole Bible in a Year" (365 days, every chapter once, straight
//     through in canonical order — see ../data/bibleReadingPlans.js)
//   - "The Bible Explains the Bible" (a cross-reference plan — each day
//     groups passages that interpret each other: prophecy/fulfillment,
//     type/antitype, or a theme traced across both Testaments — see
//     ../data/crossReferenceReadingPlan.js. A hand-curated pilot, not yet
//     whole-Bible coverage; its day rows render as an expand/collapse
//     accordion instead of a single ref, since a day can hold several
//     passages from different books)
//   - a library of "Barnabas Heart" topical plans (see
//     ../data/topicalReadingPlans.js): the Christlike qualities that
//     defined Barnabas himself and everyday life struggles (5 days each),
//     longer topical verse studies people ask real questions about
//     (health & healing, prayer, faith, etc.), and a few "life" topics
//     long enough to split in two via remedyStartsAtDay — the danger
//     Scripture names first, then God's remedy, with a small header at
//     the seam
// List view -> plan detail view (day-by-day, tap to read, tap the circle
// to mark done) -> opens the same BibleChapterModal used everywhere else.
// Progress is tracked per plan in bibleReadingPlanProgress.js, entirely
// separate from the main journal's day-1..366 journey.
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { hapticTap } from "../haptics";
import { lookupRef, parseRef } from "../bibleLookup";
import { YEAR_BIBLE_PLAN } from "../data/bibleReadingPlans";
import { CROSS_REFERENCE_PLAN } from "../data/crossReferenceReadingPlan";
import { TOPICAL_PLAN_ORDER, TOPICAL_PLANS } from "../data/topicalReadingPlans";
import {
  loadReadingPlanProgress,
  markDayComplete,
  markDayIncomplete,
  startPlan,
} from "../bibleReadingPlanProgress";
import BibleChapterModal from "../components/BibleChapterModal";

const YEAR_PLAN_ID = "year-bible-plan";
const CROSS_REF_PLAN_ID = "cross-reference-year-plan";

export default function BibleReadingPlansScreen({ onClose, onDiscussWithBarnabas }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [progress, setProgress] = useState(null); // null while loading from storage
  const [activePlanId, setActivePlanId] = useState(null);
  const [reading, setReading] = useState(null);
  // What was just read, once the chapter reader is closed — powers the
  // Philip-and-the-eunuch "did you understand what you read?" prompt
  // (Acts 8:30-31) inviting a discussion with Barnabas about it.
  const [justRead, setJustRead] = useState(null);
  // Which cross-reference plan day is expanded to show its connection blurb
  // and passage list — an accordion, since each day can hold 2-3 passages
  // from different books rather than one single reference.
  const [expandedCrossRefDay, setExpandedCrossRefDay] = useState(null);

  useEffect(() => {
    loadReadingPlanProgress().then(setProgress);
  }, []);

  const openPlan = (planId) => {
    hapticTap();
    setProgress((prev) => (prev ? startPlan(prev, planId) : prev));
    setActivePlanId(planId);
    setJustRead(null);
    setExpandedCrossRefDay(null);
  };

  const closePlan = () => {
    hapticTap();
    setActivePlanId(null);
    setJustRead(null);
    setExpandedCrossRefDay(null);
  };

  const toggleDay = (planId, day, isDone) => {
    hapticTap();
    setProgress((prev) => (prev ? (isDone ? markDayIncomplete(prev, planId, day) : markDayComplete(prev, planId, day)) : prev));
  };

  const openReading = (book, chapter, verseStart, verseEnd, meta) => {
    hapticTap();
    setReading({ book, chapter, verseStart: verseStart ?? null, verseEnd: verseEnd ?? null, meta: meta ?? null });
  };

  const openYearDay = (dayEntry) => {
    const first = dayEntry.ranges[0];
    openReading(first.book, first.from, null, null, {
      ref: dayEntry.ref,
      planTitle: t("bibleReadingPlans.yearPlan.title"),
    });
  };

  const openTopicalDay = (ref, planTitle) => {
    const pieces = parseRef(ref);
    if (!pieces || !pieces.length) return;
    const piece = pieces[0];
    openReading(piece.book, piece.chapter, piece.verseStart, piece.verseEnd, { ref, planTitle });
  };

  // A cross-reference day's individual passages already carry book/chapter/
  // verse fields directly (see ../data/crossReferenceReadingPlan.js), so no
  // ref-parsing is needed here — theme is passed as planTitle, matching how
  // topical plans use their topic title, so the "discuss with Barnabas" seed
  // message reads the same way across all three plan types.
  const openCrossRefPassage = (passage, theme) => {
    openReading(passage.book, passage.chapter, passage.verseStart, passage.verseEnd, { ref: passage.ref, planTitle: theme });
  };

  // Only topical refs are plain "Book chapter:verse[-verse]" strings that
  // lookupRef can resolve — the year plan's refs (e.g. "Genesis 1-3") span
  // whole chapters and aren't parseable, so passageText stays null for
  // those and the seed message names the reference instead of quoting it.
  const closeReading = () => {
    const meta = reading?.meta;
    setReading(null);
    if (!meta) return;
    const blocks = lookupRef(meta.ref);
    const passageText = blocks ? blocks.map((b) => b.verses.map((v) => v.text).join(" ")).join(" ") : null;
    setJustRead({ ref: meta.ref, planTitle: meta.planTitle, passageText });
  };

  const dismissJustRead = () => {
    hapticTap();
    setJustRead(null);
  };

  const discussJustRead = () => {
    hapticTap();
    onDiscussWithBarnabas?.(justRead);
    setJustRead(null);
  };

  if (progress == null) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t("bibleReadingPlans.title")} onClose={onClose} styles={styles} t={t} />
      </View>
    );
  }

  if (activePlanId) {
    const isYear = activePlanId === YEAR_PLAN_ID;
    const isCrossRef = activePlanId === CROSS_REF_PLAN_ID;
    const topical = isYear || isCrossRef ? null : TOPICAL_PLANS[activePlanId];
    const days = isYear
      ? YEAR_BIBLE_PLAN
      : isCrossRef
      ? CROSS_REFERENCE_PLAN
      : topical.refs.map((ref, i) => ({ day: i + 1, ref }));
    const planProgress = progress.plans[activePlanId] || { completedDays: [] };
    const completedSet = new Set(planProgress.completedDays);
    const firstUnfinished = days.find((d) => !completedSet.has(d.day));
    const title = isYear
      ? t("bibleReadingPlans.yearPlan.title")
      : isCrossRef
      ? t("bibleReadingPlans.crossReferencePlan.title")
      : t(`bibleReadingPlans.topics.${activePlanId}.title`);

    return (
      <View style={styles.container}>
        <ScreenHeader title={title} onClose={onClose} styles={styles} t={t} />
        <TouchableOpacity onPress={closePlan} style={styles.backBtn} accessibilityRole="button">
          <Text style={styles.backBtnText}>‹ {t("bibleReadingPlans.allPlans")}</Text>
        </TouchableOpacity>
        <Text style={styles.progressLine}>
          {t("bibleReadingPlans.progressLine", { done: planProgress.completedDays.length, total: days.length })}
        </Text>
        <FlatList
          data={days}
          keyExtractor={(item) => String(item.day)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const done = completedSet.has(item.day);
            const isNext = firstUnfinished && item.day === firstUnfinished.day;

            if (isCrossRef) {
              const expanded = expandedCrossRefDay === item.day;
              const theme = t(`bibleReadingPlans.crossReferencePlan.days.${item.day}.theme`);
              const connection = t(`bibleReadingPlans.crossReferencePlan.days.${item.day}.connection`);
              const refsLine = item.passages.map((p) => p.ref).join(" · ");
              return (
                <View style={[styles.dayRow, styles.crossRefRow, isNext && styles.dayRowNext]}>
                  <View style={styles.crossRefHeaderRow}>
                    <TouchableOpacity
                      style={styles.dayMain}
                      onPress={() => {
                        hapticTap();
                        setExpandedCrossRefDay(expanded ? null : item.day);
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.dayNumber}>{t("bibleReadingPlans.dayLabel", { day: item.day })}</Text>
                      <Text style={styles.dayRef}>{theme}</Text>
                      <Text style={styles.crossRefRefsLine}>{refsLine}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.checkBtn}
                      onPress={() => toggleDay(activePlanId, item.day, done)}
                      accessibilityRole="button"
                      accessibilityLabel={t(done ? "bibleReadingPlans.markUnread" : "bibleReadingPlans.markRead")}
                    >
                      <Ionicons
                        name={done ? "checkmark-circle" : "ellipse-outline"}
                        size={26}
                        color={done ? colors.sageDark : colors.border}
                      />
                    </TouchableOpacity>
                  </View>
                  {expanded ? (
                    <View style={styles.crossRefExpanded}>
                      <Text style={styles.crossRefConnection}>{connection}</Text>
                      {item.passages.map((p, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.crossRefPassageRow}
                          onPress={() => openCrossRefPassage(p, theme)}
                          accessibilityRole="button"
                        >
                          <Ionicons name="book-outline" size={14} color={colors.sageDark} />
                          <Text style={styles.crossRefPassageText}>{p.ref}</Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.textSoft} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            }

            // A few "life" topics (anger, hatred, sexualPurity) are split
            // in two via remedyStartsAtDay: the danger Scripture names
            // first, then God's remedy — show a small header at the seam
            // (and at day 1) so the shift in tone doesn't read as random.
            const remedyStartsAtDay = topical?.remedyStartsAtDay;
            let sectionHeader = null;
            if (remedyStartsAtDay != null) {
              if (item.day === 1) sectionHeader = t("bibleReadingPlans.dangerSectionLabel");
              else if (item.day === remedyStartsAtDay) sectionHeader = t("bibleReadingPlans.remedySectionLabel");
            }

            return (
              <View>
                {sectionHeader ? <Text style={styles.topicSectionHeader}>{sectionHeader}</Text> : null}
                <View style={[styles.dayRow, isNext && styles.dayRowNext]}>
                  <TouchableOpacity
                    style={styles.dayMain}
                    onPress={() => (isYear ? openYearDay(item) : openTopicalDay(item.ref, title))}
                    accessibilityRole="button"
                  >
                    <Text style={styles.dayNumber}>{t("bibleReadingPlans.dayLabel", { day: item.day })}</Text>
                    <Text style={styles.dayRef}>{item.ref}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => toggleDay(activePlanId, item.day, done)}
                    accessibilityRole="button"
                    accessibilityLabel={t(done ? "bibleReadingPlans.markUnread" : "bibleReadingPlans.markRead")}
                  >
                    <Ionicons
                      name={done ? "checkmark-circle" : "ellipse-outline"}
                      size={26}
                      color={done ? colors.sageDark : colors.border}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
        {justRead ? (
          <View style={styles.meditationCard}>
            <Text style={styles.meditationText}>{t("bibleReadingPlans.meditationPrompt.question")}</Text>
            <View style={styles.meditationActions}>
              <TouchableOpacity onPress={dismissJustRead} style={styles.meditationDismissBtn} accessibilityRole="button">
                <Text style={styles.meditationDismissText}>{t("bibleReadingPlans.meditationPrompt.dismissButton")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={discussJustRead} style={styles.meditationDiscussBtn} accessibilityRole="button">
                <Text style={styles.meditationDiscussText}>{t("bibleReadingPlans.meditationPrompt.discussButton")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <BibleChapterModal
          visible={!!reading}
          book={reading?.book}
          chapter={reading?.chapter}
          highlightStart={reading?.verseStart ?? null}
          highlightEnd={reading?.verseEnd ?? null}
          onClose={closeReading}
        />
      </View>
    );
  }

  const qualityTopics = TOPICAL_PLAN_ORDER.filter((id) => TOPICAL_PLANS[id].category === "quality");
  const studyTopics = TOPICAL_PLAN_ORDER.filter((id) => TOPICAL_PLANS[id].category === "study");
  const lifeTopics = TOPICAL_PLAN_ORDER.filter((id) => TOPICAL_PLANS[id].category === "life");
  const yearProgress = progress.plans[YEAR_PLAN_ID];
  const crossRefProgress = progress.plans[CROSS_REF_PLAN_ID];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("bibleReadingPlans.title")} onClose={onClose} styles={styles} t={t} />
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t("bibleReadingPlans.yearSection")}</Text>
        <TouchableOpacity style={styles.planCard} onPress={() => openPlan(YEAR_PLAN_ID)} accessibilityRole="button">
          <Ionicons name="calendar-outline" size={22} color={colors.sageDark} />
          <View style={styles.planCardBody}>
            <Text style={styles.planCardTitle}>{t("bibleReadingPlans.yearPlan.title")}</Text>
            <Text style={styles.planCardDesc}>{t("bibleReadingPlans.yearPlan.description")}</Text>
            <Text style={styles.planCardProgress}>
              {yearProgress
                ? t("bibleReadingPlans.progressLine", { done: yearProgress.completedDays.length, total: YEAR_BIBLE_PLAN.length })
                : t("bibleReadingPlans.dayCount", { count: YEAR_BIBLE_PLAN.length })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.planCard} onPress={() => openPlan(CROSS_REF_PLAN_ID)} accessibilityRole="button">
          <Ionicons name="git-network-outline" size={22} color={colors.sageDark} />
          <View style={styles.planCardBody}>
            <Text style={styles.planCardTitle}>{t("bibleReadingPlans.crossReferencePlan.title")}</Text>
            <Text style={styles.planCardDesc}>{t("bibleReadingPlans.crossReferencePlan.description")}</Text>
            <Text style={styles.planCardProgress}>
              {crossRefProgress
                ? t("bibleReadingPlans.progressLine", { done: crossRefProgress.completedDays.length, total: CROSS_REFERENCE_PLAN.length })
                : t("bibleReadingPlans.dayCount", { count: CROSS_REFERENCE_PLAN.length })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t("bibleReadingPlans.qualitySection")}</Text>
        <Text style={styles.sectionIntro}>{t("bibleReadingPlans.qualitySectionIntro")}</Text>
        {qualityTopics.map((id) => (
          <TopicCard key={id} id={id} progress={progress} onOpen={openPlan} styles={styles} colors={colors} t={t} />
        ))}

        <Text style={styles.sectionTitle}>{t("bibleReadingPlans.studySection")}</Text>
        <Text style={styles.sectionIntro}>{t("bibleReadingPlans.studySectionIntro")}</Text>
        {studyTopics.map((id) => (
          <TopicCard key={id} id={id} progress={progress} onOpen={openPlan} styles={styles} colors={colors} t={t} />
        ))}

        <Text style={styles.sectionTitle}>{t("bibleReadingPlans.lifeSection")}</Text>
        <Text style={styles.sectionIntro}>{t("bibleReadingPlans.lifeSectionIntro")}</Text>
        {lifeTopics.map((id) => (
          <TopicCard key={id} id={id} progress={progress} onOpen={openPlan} styles={styles} colors={colors} t={t} />
        ))}
      </ScrollView>
    </View>
  );
}

function TopicCard({ id, progress, onOpen, styles, colors, t }) {
  const plan = TOPICAL_PLANS[id];
  const planProgress = progress.plans[id];
  const total = plan.refs.length;
  return (
    <TouchableOpacity style={styles.planCard} onPress={() => onOpen(id)} accessibilityRole="button">
      <Ionicons name={plan.icon} size={22} color={colors.sageDark} />
      <View style={styles.planCardBody}>
        <Text style={styles.planCardTitle}>{t(`bibleReadingPlans.topics.${id}.title`)}</Text>
        <Text style={styles.planCardDesc}>{t(`bibleReadingPlans.topics.${id}.description`)}</Text>
        <Text style={styles.planCardProgress}>
          {planProgress ? t("bibleReadingPlans.progressLine", { done: planProgress.completedDays.length, total }) : t("bibleReadingPlans.dayCount", { count: total })}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
    </TouchableOpacity>
  );
}

function ScreenHeader({ title, onClose, styles, t }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("common.close")} accessibilityRole="button">
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 18 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    title: { fontSize: 20, fontWeight: "700", color: colors.sageDark, flex: 1, marginRight: 12 },
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
    backBtn: { marginBottom: 10 },
    backBtnText: { fontSize: 14, fontWeight: "700", color: colors.sageDark },
    progressLine: { fontSize: 13, color: colors.textSoft, marginBottom: 10 },
    list: { paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.sageDark, marginTop: 18, marginBottom: 4 },
    sectionIntro: { fontSize: 13, color: colors.textSoft, marginBottom: 10, lineHeight: 18 },
    planCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    planCardBody: { flex: 1 },
    planCardTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
    planCardDesc: { fontSize: 13, color: colors.textSoft, marginTop: 2, lineHeight: 18 },
    planCardProgress: { fontSize: 12, fontWeight: "600", color: colors.sageDark, marginTop: 6 },
    dayRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 8,
    },
    dayRowNext: { borderColor: colors.sageDark, backgroundColor: colors.verseCard },
    topicSectionHeader: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSoft,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 6,
    },
    dayMain: { flex: 1, marginRight: 10 },
    dayNumber: { fontSize: 12, fontWeight: "700", color: colors.sageDark, marginBottom: 2 },
    dayRef: { fontSize: 15, fontWeight: "600", color: colors.text },
    checkBtn: { padding: 4 },
    crossRefRow: { flexDirection: "column", alignItems: "stretch" },
    crossRefHeaderRow: { flexDirection: "row", alignItems: "center" },
    crossRefRefsLine: { fontSize: 12, color: colors.textSoft, marginTop: 2 },
    crossRefExpanded: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    crossRefConnection: { fontSize: 13, color: colors.text, lineHeight: 19, marginBottom: 10 },
    crossRefPassageRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    crossRefPassageText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.sageDark },
    meditationCard: {
      borderWidth: 1,
      borderColor: colors.sageDark,
      backgroundColor: colors.verseCard,
      borderRadius: 14,
      padding: 14,
      marginTop: 4,
      marginBottom: 12,
    },
    meditationText: { fontSize: 14, lineHeight: 20, color: colors.text, marginBottom: 12 },
    meditationActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    meditationDismissBtn: { paddingVertical: 8, paddingHorizontal: 12 },
    meditationDismissText: { fontSize: 13, fontWeight: "600", color: colors.textSoft },
    meditationDiscussBtn: {
      backgroundColor: colors.buttonBg,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    meditationDiscussText: { fontSize: 13, fontWeight: "700", color: colors.buttonOnText },
  });
}
