// Headless JS task that draws the Android home-screen widget. Runs outside
// the normal app component tree (the app may not even be open), so it reads
// the same AsyncStorage key the app itself persists to directly, rather than
// going through the useJournalStore hook, and re-derives "today's" verse
// using the exact same functions TodayScreen uses (pickForDay,
// pickVerseVersion) so the two never disagree about what day it is or which
// translation is showing.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { unlockedDayFor, pickForDay, pickVerseVersion } from "../content";
import { BIBLE_VERSIONS, VERSES } from "../data/verses";
import { TodayVerseWidget } from "./TodayVerseWidget";

const STORAGE_KEY = "barnabasJournalStateV2";
const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);
const FALLBACK_TEXT = "Open Barnabas Journal to start your daily verse.";

async function resolveTodayVerse() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { text: FALLBACK_TEXT, ref: "" };

    const state = JSON.parse(raw);
    if (!state?.journeyStartDate || !Array.isArray(state.order)) {
      return { text: FALLBACK_TEXT, ref: "" };
    }

    const dayNumber = unlockedDayFor(state.journeyStartDate);
    const verse = pickForDay(VERSES, dayNumber, state.order);
    const versionId = pickVerseVersion(dayNumber, state.settings || {}, VERSE_VERSION_IDS);
    const text = verse.versions[versionId] || verse.versions.KJV;

    return { text, ref: `${verse.ref} (${versionId})` };
  } catch {
    return { text: FALLBACK_TEXT, ref: "" };
  }
}

export async function widgetTaskHandler(props) {
  if (props.widgetAction === "WIDGET_DELETED") return;

  const { text, ref } = await resolveTodayVerse();
  props.renderWidget(<TodayVerseWidget verseText={text} verseRef={ref} />);
}
