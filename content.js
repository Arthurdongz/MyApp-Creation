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

function pickForDay(arr, dayNumber, order) {
  const idx = order[(dayNumber - 1) % order.length];
  return arr[idx];
}

// For banks smaller than the full 366 (like the true-stories bank, which
// grows over time), still route through the user's per-user shuffle order
// so the sequence doesn't feel like a flat repeating loop, but wrap it down
// to the bank's actual size.
function pickForDaySmallBank(arr, dayNumber, order) {
  const idx = order[(dayNumber - 1) % order.length] % arr.length;
  return arr[idx];
}
