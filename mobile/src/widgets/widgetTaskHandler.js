// Headless JS task that draws the Android home-screen widgets. Runs outside
// the normal app component tree (the app may not even be open), so it reads
// the same AsyncStorage key the app itself persists to directly, rather than
// going through the useJournalStore hook, and re-derives "today's" content
// using the exact same functions the in-app screens use (pickForDay,
// pickVerseVersion) so the widgets never disagree with the app about what
// day it is or which translation is showing. Dispatches on
// props.widgetInfo.widgetName (set per widget in app.json's
// react-native-android-widget config) to draw the right widget.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { unlockedDayFor, pickForDay, pickVerseVersion } from "../content";
import { BIBLE_VERSIONS, VERSES } from "../data/verses";
import { HIGHLIGHTS } from "../data/highlights";
import { TodayVerseWidget } from "./TodayVerseWidget";
import { TodayFactWidget } from "./TodayFactWidget";

const STORAGE_KEY = "barnabasJournalStateV2";
// See storage.js for why this exists: journeyStartDate/order are set once
// and never change, so this small mirror key is the resilient source of
// truth for them — the widget prefers it over the (larger, more
// failure-prone) main state blob whenever both are available.
const IDENTITY_KEY = "barnabasJournalIdentityV1";
const VERSE_VERSION_IDS = BIBLE_VERSIONS.map((v) => v.id);
const FALLBACK_TEXT = "Open Barnabas Journal to start your daily verse.";
const FALLBACK_FACT_TEXT = "Open Barnabas Journal to see today's fact.";

async function loadIdentityAndState() {
  const [rawIdentity, raw] = await Promise.all([
    AsyncStorage.getItem(IDENTITY_KEY),
    AsyncStorage.getItem(STORAGE_KEY),
  ]);

  let identity = null;
  if (rawIdentity) {
    const parsedIdentity = JSON.parse(rawIdentity);
    if (parsedIdentity?.journeyStartDate && Array.isArray(parsedIdentity.order)) {
      identity = parsedIdentity;
    }
  }

  const state = raw ? JSON.parse(raw) : null;
  const journeyStartDate = identity?.journeyStartDate || state?.journeyStartDate;
  const order = identity?.order || state?.order;
  return { state, journeyStartDate, order };
}

async function resolveTodayVerse() {
  try {
    const { state, journeyStartDate, order } = await loadIdentityAndState();
    if (!journeyStartDate || !Array.isArray(order)) {
      return { text: FALLBACK_TEXT, ref: "" };
    }

    const dayNumber = unlockedDayFor(journeyStartDate);
    const verse = pickForDay(VERSES, dayNumber, order);
    const versionId = pickVerseVersion(dayNumber, state?.settings || {}, VERSE_VERSION_IDS);
    const text = verse.versions[versionId] || verse.versions.KJV;

    return { text, ref: `${verse.ref} (${versionId})` };
  } catch {
    return { text: FALLBACK_TEXT, ref: "" };
  }
}

async function resolveTodayFact() {
  try {
    const { journeyStartDate, order } = await loadIdentityAndState();
    if (!journeyStartDate || !Array.isArray(order)) {
      return { text: FALLBACK_FACT_TEXT };
    }

    const dayNumber = unlockedDayFor(journeyStartDate);
    const text = pickForDay(HIGHLIGHTS, dayNumber, order);
    return { text };
  } catch {
    return { text: FALLBACK_FACT_TEXT };
  }
}

export async function widgetTaskHandler(props) {
  if (props.widgetAction === "WIDGET_DELETED") return;

  if (props.widgetInfo.widgetName === "TodayFact") {
    const { text } = await resolveTodayFact();
    props.renderWidget(<TodayFactWidget factText={text} />);
    return;
  }

  const { text, ref } = await resolveTodayVerse();
  props.renderWidget(<TodayVerseWidget verseText={text} verseRef={ref} />);
}
