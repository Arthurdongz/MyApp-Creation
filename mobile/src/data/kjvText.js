// Lazily loads bible-kjv.json (~4.2MB) — the always-bundled KJV text
// backing confession/verse-of-the-day lookups (bibleLookup.js) and the
// chapter reader's KJV column (bibleVersions.js, BibleChapterModal.js).
//
// A plain top-level `import` here would parse this whole file into memory
// on every app launch, for every user, whether or not they ever open the
// Bible reader. Using `require()` inside a function instead defers that
// parse to the first actual call — Metro still bundles the JSON (this is a
// single-bundle app, not code-split over the network), but the parse cost
// is only paid once, on demand, not at startup. The result is memoized so
// every caller after the first gets the same parsed array back
// synchronously, with no loading state to handle.
let kjvText = null;

export function getKjvText() {
  if (!kjvText) {
    kjvText = require("./bible-kjv.json");
  }
  return kjvText;
}
