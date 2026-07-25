// Shared day-indexing logic for the Barnabas Journal content banks.
// Actual content lives in data-verses.js, data-encouragements.js,
// data-moments.js, and data-wisdom.js (each exactly 366 entries — one for
// every day of the year, including a leap day — loaded before this file).

function dayOfYearIndex() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfToday - startOfYear) / 86400000);
}

function pickForToday(arr) {
  const idx = dayOfYearIndex() % arr.length;
  return arr[idx];
}
