// Bible reading plans, reached from the same ☰ menu group as the full
// Bible browser and saved highlights — not the bottom tab bar — since
// these are all "ways into the Bible," not daily journal content. Two
// kinds of plan:
//   - one "Whole Bible in a Year" plan (365 days, every chapter once, see
//     ../data/bibleReadingPlans.js for how it was generated)
//   - a library of short "Barnabas Heart" topical mini-plans (5 days each,
//     see ../data/topicalReadingPlans.js), split into the Christlike
//     qualities that defined Barnabas himself and everyday life topics
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
import { TOPICAL_PLAN_ORDER, TOPICAL_PLANS } from "../data/topicalReadingPlans";
import {
  loadReadingPlanProgress,
  markDayComplete,
  markDayIncomplete,
  startPlan,
} from "../bibleReadingPlanProgress";
import BibleChapterModal from "../components/BibleChapterModal";

const YEAR_PLAN_ID = "year-bible-plan";

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

  useEffect(() => {
    loadReadingPlanProgress().then(setProgress);
  }, []);

  const openPlan = (planId) => {
    hapticTap();
    setProgress((prev) => (prev ? startPlan(prev, planId) : prev));
    setActivePlanId(planId);
    setJustRead(null);
  };

  const closePlan = () => {
    hapticTap();
    setActivePlanId(null);
    setJustRead(null);
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
    const topical = isYear ? null : TOPICAL_PLANS[activePlanId];
    const days = isYear ? YEAR_BIBLE_PLAN : topical.refs.map((ref, i) => ({ day: i + 1, ref }));
    const planProgress = progress.plans[activePlanId] || { completedDays: [] };
    const completedSet = new Set(planProgress.completedDays);
    const firstUnfinished = days.find((d) => !completedSet.has(d.day));
    const title = isYear ? t("bibleReadingPlans.yearPlan.title") : t(`bibleReadingPlans.topics.${activePlanId}.title`);

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
            return (
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
  const lifeTopics = TOPICAL_PLAN_ORDER.filter((id) => TOPICAL_PLANS[id].category === "life");
  const yearProgress = progress.plans[YEAR_PLAN_ID];

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

        <Text style={styles.sectionTitle}>{t("bibleReadingPlans.qualitySection")}</Text>
        <Text style={styles.sectionIntro}>{t("bibleReadingPlans.qualitySectionIntro")}</Text>
        {qualityTopics.map((id) => (
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
    dayMain: { flex: 1, marginRight: 10 },
    dayNumber: { fontSize: 12, fontWeight: "700", color: colors.sageDark, marginBottom: 2 },
    dayRef: { fontSize: 15, fontWeight: "600", color: colors.text },
    checkBtn: { padding: 4 },
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
