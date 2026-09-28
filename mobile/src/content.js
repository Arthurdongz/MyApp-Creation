// Shared day-indexing and per-user shuffling logic for the Barnabas Journal
// content banks. Each data bank (verses, encouragements, moments, wisdom)
// has exactly 366 entries.
//
// Each user gets their own random shuffle of the 366 day-slots, generated
// once on first use and stored locally, so "Day 1" shows different content
// for different people while staying stable for that person forever after.
// A new day unlocks once per real calendar day since the user's journey
// started; users can navigate back through days they've already reached,
// but not ahead of the current unlocked day.

export const TOTAL_DAYS = 366;

function dateKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function todayKey() {
  return dateKey(new Date());
}

// The actual calendar date a given journey day number fell (or falls) on,
// regardless of whether the user ever viewed it.
export function dateKeyForDayNumber(journeyStartKey, dayNumber) {
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
export function shuffledOrder(length) {
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
export function unlockedDayFor(journeyStartKey) {
  const elapsed = daysBetweenKeys(journeyStartKey, todayKey());
  return Math.min(TOTAL_DAYS, Math.max(1, elapsed + 1));
}

// A user's shuffled day-order must be exactly TOTAL_DAYS integer indices
// (0..TOTAL_DAYS-1) for pickForDay/pickForDaySmallBank's indexing to be
// safe. Used to reject a corrupted or malformed `order` — from a bad
// backup file, a hand-edited storage blob, or any other source — before
// it's ever accepted into state, rather than letting it crash the app the
// first time a content lookup runs against it.
export function isValidOrder(order) {
  return (
    Array.isArray(order) &&
    order.length === TOTAL_DAYS &&
    order.every((n) => Number.isInteger(n) && n >= 0 && n < TOTAL_DAYS)
  );
}

// Defensive fallback for when `order` is well-formed as an array but the
// computed index still can't be trusted (e.g. a mismatched content bank
// length) — wraps into range instead of indexing out of bounds and
// returning `undefined` to a caller that assumes real content.
function safeIndex(idx, length) {
  if (!Number.isFinite(idx) || length <= 0) return 0;
  return ((idx % length) + length) % length;
}

export function pickForDay(arr, dayNumber, order) {
  const rawIdx = order[(dayNumber - 1) % order.length];
  return arr[safeIndex(rawIdx, arr.length)];
}

// For banks smaller than the full 366 (like true stories, journal prompts,
// Barnabas principles, and welcome teasers, all of which grow over time),
// still route through the user's per-user shuffle order so the sequence
// doesn't feel like a flat repeating loop.
//
// This used to just take `order[(dayNumber - 1) % order.length] % arr.length`
// — but since `order` is a full random shuffle of 0..365, that modulo lands
// on essentially a random value in [0, arr.length) for every day, with no
// guarantee of spacing between repeats of the same entry. Two occurrences of
// the same item could land, by chance, just days apart (this is exactly what
// happened with the wisdom quotes bank repeating an entry 4 calendar days
// later, back when it only had 91 entries — since expanded to a full 366,
// like every other daily bank, and switched to pickForDay instead).
//
// Instead, derive one fixed permutation of the bank from the user's `order`
// (ranking its first `arr.length` values) and cycle through that same
// permutation every time it runs out, rather than reshuffling per cycle.
// A reshuffle-per-cycle approach seems more "random," but provably can't
// avoid an occasional short-distance repeat right at the seam between two
// cycles (whichever item lands last in one cycle can land early in the
// next); a fixed, repeating cycle is the only way to *guarantee* every
// repeat is exactly `arr.length` days apart, never closer — the same
// guarantee a full 366-entry bank gets for free from `pickForDay`.
function argsort(values) {
  return values.map((_, i) => i).sort((a, b) => values[a] - values[b]);
}

export function pickForDaySmallBank(arr, dayNumber, order) {
  const size = arr.length;
  if (size <= 0) return undefined;
  const perm = argsort(order.slice(0, size));
  return arr[perm[(dayNumber - 1) % size]];
}

// Which Bible translation to show for a given day: either a pinned favorite
// version (same every day), or rotating through the available versions one
// per day so the variety is visible over time.
export function pickVerseVersion(dayNumber, settings, versionIds) {
  if (settings.verseVersionMode === "favorite" && settings.verseFavoriteVersion) {
    return settings.verseFavoriteVersion;
  }
  const ids = versionIds && versionIds.length ? versionIds : ["KJV"];
  return ids[(dayNumber - 1) % ids.length];
}

// The date key for "today plus N days" — used to preview which day's
// content will show on a future date (e.g. when scheduling reminder
// notifications ahead of time).
export function dateKeyForOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return dateKey(d);
}

// Like unlockedDayFor, but for an arbitrary target date rather than today.
export function dayNumberForDate(journeyStartKey, targetKey) {
  const elapsed = daysBetweenKeys(journeyStartKey, targetKey);
  return Math.min(TOTAL_DAYS, Math.max(1, elapsed + 1));
}
