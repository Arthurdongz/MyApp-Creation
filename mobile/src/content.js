// Shared day-indexing logic for the Barnabas Journal content banks.
// Each data bank (verses, encouragements, moments, wisdom) has exactly 366
// entries — one for every day of the year, including a leap day.

export function dayOfYearIndex() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startOfToday - startOfYear) / 86400000);
}

export function pickForToday(arr) {
  const idx = dayOfYearIndex() % arr.length;
  return arr[idx];
}

export function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
