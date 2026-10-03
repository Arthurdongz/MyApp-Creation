// Shared day-indexing and per-user shuffling logic for the Barnabas Journal
// content banks. Actual content lives in data-verses.js,
// data-encouragements.js, data-moments.js, and data-wisdom.js (each exactly
// 366 entries — one for every day of a journey, including a leap-year-sized
// buffer — loaded before this file).
//
// Each user gets their own random shuffle of the 366 day-slots, generated
// once on first use and stored locally, so "Day 1" shows different content
// for different people while staying stable for that person forever after.
// A new day unlocks once per real calendar day since the user's journey
// started; users can navigate back through days they've already reached,
// but not ahead of the current unlocked day.

const TOTAL_DAYS = 366;

function dateKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function todayDateKey() {
  return dateKey(new Date());
}

// The actual calendar date a given journey day number fell (or falls) on,
// regardless of whether the user ever viewed it.
function dateKeyForDayNumber(journeyStartKey, dayNumber) {
  const [y, m, d] = journeyStartKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + (dayNumber - 1));
  return dateKey(date);
}

function daysBetweenKeys(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  return Math.round((to - from) / 86400000);
}

// Fisher-Yates shuffle of [0, 1, ..., length - 1].
function shuffledOrder(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// How many days of content are unlocked for this user, given the calendar
// date their journey began. Advances by exactly one per real calendar day,
// capped at TOTAL_DAYS.
function unlockedDayFor(journeyStartKey) {
  const elapsed = daysBetweenKeys(journeyStartKey, todayDateKey());
  return Math.min(TOTAL_DAYS, Math.max(1, elapsed + 1));
}

function daysSinceKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const from = new Date(y, m - 1, d);
  const to = new Date();
  to.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  return Math.round((to - from) / 86400000);
}

function countStrugglingDays(entries, latestDay) {
  const start = Math.max(1, latestDay - 6);
  let strugglingCount = 0;
  for (let day = start; day <= latestDay; day++) {
    const entry = entries[`day-${day}`];
    if (entry && entry.mood === "struggling") strugglingCount += 1;
  }
  return strugglingCount;
}

// A gentle, rate-limited nudge toward real crisis resources when someone's
// logged mood has been "struggling" often over the last week. Shown at most
// once every 14 days even if the pattern continues, so it never feels like
// nagging — "days > 0" lets it stay visible for the rest of the day it's
// first triggered on, since that's the same day lastShownAt gets set to.
function computeShowCrisisNudge(entries, latestDay, lastShownAt) {
  if (lastShownAt) {
    const days = daysSinceKey(lastShownAt);
    if (days > 0 && days < 14) return false;
  }
  return countStrugglingDays(entries, latestDay) >= 3;
}

// A softer companion to the crisis nudge — fires on a lighter, earlier
// signal (2 struggling days in the last week rather than 3+), offering
// human connection or a reflective pause instead of crisis resources.
// Suppressed whenever the crisis nudge itself is showing, so the two never
// stack into two heavy cards at once.
function computeShowCheckInNudge(entries, latestDay, lastShownAt, showCrisisNudge) {
  if (showCrisisNudge) return false;
  if (lastShownAt) {
    const days = daysSinceKey(lastShownAt);
    if (days > 0 && days < 14) return false;
  }
  return countStrugglingDays(entries, latestDay) >= 2;
}

// A quick look back at the last 7 journey days (or fewer, near the very
// start of a journey) — how many days had any activity, how many Barnabas
// Moments got done, and how many journal entries got written.
function computeWeeklyRecap(entries, latestDay) {
  const start = Math.max(1, latestDay - 6);
  let daysShownUp = 0;
  let momentsDone = 0;
  let journalEntries = 0;
  let kindnessReceived = 0;
  for (let day = start; day <= latestDay; day++) {
    const entry = entries[`day-${day}`];
    if (!entry) continue;
    if (entry.starsAwarded.daily || entry.starsAwarded.moment || entry.starsAwarded.journal) {
      daysShownUp += 1;
    }
    if (entry.momentDone) momentsDone += 1;
    if (entry.reflection || entry.barnabasNote) journalEntries += 1;
    if (entry.receivedKindness) kindnessReceived += 1;
  }
  return { daysShownUp, momentsDone, journalEntries, kindnessReceived, totalDays: latestDay - start + 1 };
}

function pickForDay(arr, dayNumber, order) {
  const idx = order[(dayNumber - 1) % order.length];
  return arr[idx];
}

// Which Bible translation to show for a given day: either a pinned favorite
// version (same every day), or rotating through the available versions one
// per day so the variety is visible over time.
function pickVerseVersion(dayNumber, settings, versionIds) {
  if (settings.verseVersionMode === "favorite" && settings.verseFavoriteVersion) {
    return settings.verseFavoriteVersion;
  }
  const ids = versionIds && versionIds.length ? versionIds : ["KJV"];
  return ids[(dayNumber - 1) % ids.length];
}


// For banks smaller than the full 366 (like the true-stories bank, which
// grows over time), still route through the user's per-user shuffle order
// so the sequence doesn't feel like a flat repeating loop, but wrap it down
// to the bank's actual size.
function pickForDaySmallBank(arr, dayNumber, order) {
  const idx = order[(dayNumber - 1) % order.length] % arr.length;
  return arr[idx];
}
