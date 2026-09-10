// "The Bible Explains the Bible" — a cross-reference reading plan, alongside
// (not replacing) the sequential Whole-Bible-in-a-Year plan in
// bibleReadingPlans.js. Instead of walking straight through in canonical
// order, each day groups 2-3 passages that interpret each other: a promise
// and its fulfillment centuries later (Micah 5:2 -> Luke 2:1-7), a curse and
// its later fulfillment (Joshua 6:26 -> 1 Kings 16:34), a type and its
// antitype (the bronze serpent -> John 3:14-21), or a theme traced across
// both Testaments (the Good Shepherd: Psalm 23, Ezekiel 34, John 10). The
// goal is the one the Ethiopian eunuch needed Philip for (Acts 8:30-31):
// helping a reader see how Scripture opens itself up.
//
// This is a hand-curated pilot, not yet whole-Bible coverage — see the
// crossReferencePlan.description i18n string, which says so plainly in the
// app. More days get added over time until every book and chapter has a
// place in it; nothing here claims completeness yet.
//
// Every book/chapter/verse reference below has been checked against
// src/data/bible-kjv.json (see the validation script used while building
// this file) — book names match src/data/bible-books.js exactly. A
// passage's verseStart/verseEnd are null for a whole-chapter reading;
// `ref` is the display string shown in the UI and fed to lookupRef() for
// the "discuss with Barnabas" meditation prompt (only resolves for
// verse-level refs — a bare "Book chapter" ref, like a whole-chapter
// reading, intentionally isn't parseable there, same as the year plan).

export const CROSS_REFERENCE_PLAN = [
  {
    day: 1,
    passages: [
      { ref: "Genesis 1", book: "Genesis", chapter: 1, verseStart: null, verseEnd: null },
      { ref: "John 1:1-14", book: "John", chapter: 1, verseStart: 1, verseEnd: 14 },
      { ref: "Revelation 21:1-5", book: "Revelation", chapter: 21, verseStart: 1, verseEnd: 5 },
    ],
  },
  {
    day: 2,
    passages: [
      { ref: "Exodus 12", book: "Exodus", chapter: 12, verseStart: null, verseEnd: null },
      { ref: "John 19:31-37", book: "John", chapter: 19, verseStart: 31, verseEnd: 37 },
      { ref: "1 Corinthians 5:6-8", book: "1 Corinthians", chapter: 5, verseStart: 6, verseEnd: 8 },
    ],
  },
  {
    day: 3,
    passages: [
      { ref: "Joshua 6:20-27", book: "Joshua", chapter: 6, verseStart: 20, verseEnd: 27 },
      { ref: "1 Kings 16:29-34", book: "1 Kings", chapter: 16, verseStart: 29, verseEnd: 34 },
    ],
  },
  {
    day: 4,
    passages: [
      { ref: "Genesis 22:1-19", book: "Genesis", chapter: 22, verseStart: 1, verseEnd: 19 },
      { ref: "John 3:14-17", book: "John", chapter: 3, verseStart: 14, verseEnd: 17 },
      { ref: "Romans 8:32", book: "Romans", chapter: 8, verseStart: 32, verseEnd: 32 },
    ],
  },
  {
    day: 5,
    passages: [
      { ref: "Numbers 21:4-9", book: "Numbers", chapter: 21, verseStart: 4, verseEnd: 9 },
      { ref: "John 3:14-21", book: "John", chapter: 3, verseStart: 14, verseEnd: 21 },
    ],
  },
  {
    day: 6,
    passages: [
      { ref: "Genesis 14:17-20", book: "Genesis", chapter: 14, verseStart: 17, verseEnd: 20 },
      { ref: "Psalm 110", book: "Psalm", chapter: 110, verseStart: null, verseEnd: null },
      { ref: "Hebrews 7", book: "Hebrews", chapter: 7, verseStart: null, verseEnd: null },
    ],
  },
  {
    day: 7,
    passages: [
      { ref: "Exodus 16", book: "Exodus", chapter: 16, verseStart: null, verseEnd: null },
      { ref: "John 6:25-40", book: "John", chapter: 6, verseStart: 25, verseEnd: 40 },
    ],
  },
  {
    day: 8,
    passages: [
      { ref: "Psalm 23", book: "Psalm", chapter: 23, verseStart: null, verseEnd: null },
      { ref: "Ezekiel 34", book: "Ezekiel", chapter: 34, verseStart: null, verseEnd: null },
      { ref: "John 10:1-18", book: "John", chapter: 10, verseStart: 1, verseEnd: 18 },
    ],
  },
  {
    day: 9,
    passages: [
      { ref: "Proverbs 8", book: "Proverbs", chapter: 8, verseStart: null, verseEnd: null },
      { ref: "Colossians 1:15-20", book: "Colossians", chapter: 1, verseStart: 15, verseEnd: 20 },
    ],
  },
  {
    day: 10,
    passages: [
      { ref: "1 Samuel 2:1-10", book: "1 Samuel", chapter: 2, verseStart: 1, verseEnd: 10 },
      { ref: "Luke 1:46-55", book: "Luke", chapter: 1, verseStart: 46, verseEnd: 55 },
    ],
  },
  {
    day: 11,
    passages: [
      { ref: "Jonah 1", book: "Jonah", chapter: 1, verseStart: null, verseEnd: null },
      { ref: "Matthew 12:38-41", book: "Matthew", chapter: 12, verseStart: 38, verseEnd: 41 },
    ],
  },
  {
    day: 12,
    passages: [
      { ref: "Isaiah 53", book: "Isaiah", chapter: 53, verseStart: null, verseEnd: null },
      { ref: "Acts 8:26-35", book: "Acts", chapter: 8, verseStart: 26, verseEnd: 35 },
      { ref: "1 Peter 2:21-25", book: "1 Peter", chapter: 2, verseStart: 21, verseEnd: 25 },
    ],
  },
  {
    day: 13,
    passages: [
      { ref: "Isaiah 45:1-7", book: "Isaiah", chapter: 45, verseStart: 1, verseEnd: 7 },
      { ref: "Ezra 1:1-4", book: "Ezra", chapter: 1, verseStart: 1, verseEnd: 4 },
    ],
  },
  {
    day: 14,
    passages: [
      { ref: "Isaiah 7:14", book: "Isaiah", chapter: 7, verseStart: 14, verseEnd: 14 },
      { ref: "Matthew 1:18-23", book: "Matthew", chapter: 1, verseStart: 18, verseEnd: 23 },
    ],
  },
  {
    day: 15,
    passages: [
      { ref: "Micah 5:2", book: "Micah", chapter: 5, verseStart: 2, verseEnd: 2 },
      { ref: "Luke 2:1-7", book: "Luke", chapter: 2, verseStart: 1, verseEnd: 7 },
    ],
  },
  {
    day: 16,
    passages: [
      { ref: "Zechariah 9:9", book: "Zechariah", chapter: 9, verseStart: 9, verseEnd: 9 },
      { ref: "Matthew 21:1-11", book: "Matthew", chapter: 21, verseStart: 1, verseEnd: 11 },
    ],
  },
  {
    day: 17,
    passages: [
      { ref: "Zechariah 11:12-13", book: "Zechariah", chapter: 11, verseStart: 12, verseEnd: 13 },
      { ref: "Matthew 27:3-10", book: "Matthew", chapter: 27, verseStart: 3, verseEnd: 10 },
    ],
  },
  {
    day: 18,
    passages: [
      { ref: "Psalm 22", book: "Psalm", chapter: 22, verseStart: null, verseEnd: null },
      { ref: "Matthew 27:35-46", book: "Matthew", chapter: 27, verseStart: 35, verseEnd: 46 },
    ],
  },
  {
    day: 19,
    passages: [
      { ref: "Psalm 16:8-11", book: "Psalm", chapter: 16, verseStart: 8, verseEnd: 11 },
      { ref: "Acts 2:22-32", book: "Acts", chapter: 2, verseStart: 22, verseEnd: 32 },
    ],
  },
  {
    day: 20,
    passages: [
      { ref: "Jeremiah 31:31-34", book: "Jeremiah", chapter: 31, verseStart: 31, verseEnd: 34 },
      { ref: "Luke 22:14-20", book: "Luke", chapter: 22, verseStart: 14, verseEnd: 20 },
      { ref: "Hebrews 8", book: "Hebrews", chapter: 8, verseStart: null, verseEnd: null },
    ],
  },
  {
    day: 21,
    passages: [
      { ref: "Leviticus 16", book: "Leviticus", chapter: 16, verseStart: null, verseEnd: null },
      { ref: "Hebrews 9:23-28", book: "Hebrews", chapter: 9, verseStart: 23, verseEnd: 28 },
    ],
  },
  {
    day: 22,
    passages: [
      { ref: "1 Kings 18:20-40", book: "1 Kings", chapter: 18, verseStart: 20, verseEnd: 40 },
      { ref: "Malachi 4:5-6", book: "Malachi", chapter: 4, verseStart: 5, verseEnd: 6 },
      { ref: "Luke 1:13-17", book: "Luke", chapter: 1, verseStart: 13, verseEnd: 17 },
    ],
  },
  {
    day: 23,
    passages: [
      { ref: "Esther 4", book: "Esther", chapter: 4, verseStart: null, verseEnd: null },
      { ref: "Romans 8:28", book: "Romans", chapter: 8, verseStart: 28, verseEnd: 28 },
    ],
  },
  {
    day: 24,
    passages: [
      { ref: "Job 1", book: "Job", chapter: 1, verseStart: null, verseEnd: null },
      { ref: "James 5:7-11", book: "James", chapter: 5, verseStart: 7, verseEnd: 11 },
    ],
  },
  {
    day: 25,
    passages: [
      { ref: "Daniel 3", book: "Daniel", chapter: 3, verseStart: null, verseEnd: null },
      { ref: "Isaiah 43:1-3", book: "Isaiah", chapter: 43, verseStart: 1, verseEnd: 3 },
    ],
  },
  {
    day: 26,
    passages: [
      { ref: "Nehemiah 2:11-20", book: "Nehemiah", chapter: 2, verseStart: 11, verseEnd: 20 },
      { ref: "Ephesians 2:19-22", book: "Ephesians", chapter: 2, verseStart: 19, verseEnd: 22 },
    ],
  },
  {
    day: 27,
    passages: [
      { ref: "Psalm 103", book: "Psalm", chapter: 103, verseStart: null, verseEnd: null },
      { ref: "Luke 15:11-32", book: "Luke", chapter: 15, verseStart: 11, verseEnd: 32 },
    ],
  },
  {
    day: 28,
    passages: [
      { ref: "Deuteronomy 6:4-9", book: "Deuteronomy", chapter: 6, verseStart: 4, verseEnd: 9 },
      { ref: "Matthew 22:34-40", book: "Matthew", chapter: 22, verseStart: 34, verseEnd: 40 },
      { ref: "1 Corinthians 13", book: "1 Corinthians", chapter: 13, verseStart: null, verseEnd: null },
    ],
  },
  {
    day: 29,
    passages: [
      { ref: "Isaiah 61:1-3", book: "Isaiah", chapter: 61, verseStart: 1, verseEnd: 3 },
      { ref: "Luke 4:16-21", book: "Luke", chapter: 4, verseStart: 16, verseEnd: 21 },
    ],
  },
  {
    day: 30,
    passages: [
      { ref: "Isaiah 65:17-25", book: "Isaiah", chapter: 65, verseStart: 17, verseEnd: 25 },
      { ref: "Revelation 21:1-8", book: "Revelation", chapter: 21, verseStart: 1, verseEnd: 8 },
      { ref: "Revelation 22:1-5", book: "Revelation", chapter: 22, verseStart: 1, verseEnd: 5 },
    ],
  },
];
