// "Barnabas Heart" topical reading plans — short mini reading plans
// grouped into three categories:
//   - "quality": the Christlike qualities that defined Barnabas himself
//     (Acts 4:36, 11:22-24) — encouragement, love, peace, forgiveness,
//     hope, humility, generosity, faithfulness, joy, courage. (5 days each)
//   - "life": the everyday struggles a Barnabas-hearted reader is likely
//     walking through, or walking alongside someone else through —
//     anxiety, grief, waiting, doubt, weariness (5 days each), and three
//     longer ones on temptations people wrestle with — anger, hatred,
//     sexualPurity — each split into two halves via `remedyStartsAtDay`:
//     first what Scripture warns the danger is, then God's remedy for it.
//   - "study": topical verse collections on subjects people ask real
//     questions about — health & healing, long life, prayer, fasting,
//     faith, righteousness. Longer than the quality/life plans (12-19
//     refs each) since the point is breadth, not a 5-day pace. None of
//     these lists claim to be every verse Scripture has on the subject —
//     see bibleReadingPlans.studySectionIntro, which says so in the app —
//     but each is a substantial, real cross-section, and more get added
//     over time.
// Each plan's title and description live in i18n
// (bibleReadingPlans.topics.<id>.title / .description) rather than here,
// since they're UI copy; the references themselves are language-neutral
// (the actual passage text is read from the existing full-Bible reader in
// whatever translation the user has picked). Every reference below was
// verified against this project's own bundled KJV text before inclusion —
// see the reading-plan feature's scratchpad verification pass.
export const TOPICAL_PLAN_ORDER = [
  "encouragement",
  "love",
  "peace",
  "forgiveness",
  "hope",
  "humility",
  "generosity",
  "faithfulness",
  "joy",
  "courage",
  "healing",
  "longLife",
  "prayer",
  "fasting",
  "faith",
  "righteousness",
  "anxiety",
  "grief",
  "waiting",
  "doubt",
  "weariness",
  "anger",
  "hatred",
  "sexualPurity",
];

export const TOPICAL_PLANS = {
  encouragement: {
    id: "encouragement",
    category: "quality",
    icon: "megaphone-outline",
    refs: ["Acts 4:36-37", "1 Thessalonians 5:11", "Hebrews 10:24-25", "Acts 11:23-24", "Isaiah 35:3-4"],
  },
  love: {
    id: "love",
    category: "quality",
    icon: "heart-outline",
    refs: ["1 Corinthians 13:4-7", "John 13:34-35", "1 John 4:7-8", "Romans 5:8", "1 John 3:16-18"],
  },
  peace: {
    id: "peace",
    category: "quality",
    icon: "leaf-outline",
    refs: ["John 14:27", "Philippians 4:6-7", "Isaiah 26:3", "Colossians 3:15", "Romans 5:1"],
  },
  forgiveness: {
    id: "forgiveness",
    category: "quality",
    icon: "hand-left-outline",
    refs: ["Matthew 6:14-15", "Ephesians 4:32", "Colossians 3:13", "Matthew 18:21-22", "Psalm 103:10-12"],
  },
  hope: {
    id: "hope",
    category: "quality",
    icon: "sunny-outline",
    refs: ["Romans 15:13", "Jeremiah 29:11", "Romans 8:24-25", "1 Peter 1:3", "Lamentations 3:22-24"],
  },
  humility: {
    id: "humility",
    category: "quality",
    icon: "arrow-down-circle-outline",
    refs: ["Philippians 2:3-4", "James 4:10", "Micah 6:8", "Matthew 11:29", "1 Peter 5:6"],
  },
  generosity: {
    id: "generosity",
    category: "quality",
    icon: "gift-outline",
    refs: ["Acts 4:34-37", "2 Corinthians 9:6-7", "Proverbs 11:24-25", "Luke 6:38", "Acts 20:35"],
  },
  faithfulness: {
    id: "faithfulness",
    category: "quality",
    icon: "shield-checkmark-outline",
    refs: ["Lamentations 3:22-23", "1 Corinthians 4:2", "Galatians 6:9", "2 Timothy 4:7", "Hebrews 10:23"],
  },
  joy: {
    id: "joy",
    category: "quality",
    icon: "happy-outline",
    refs: ["Nehemiah 8:10", "John 15:10-11", "Psalm 30:5", "James 1:2-4", "Habakkuk 3:17-18"],
  },
  courage: {
    id: "courage",
    category: "quality",
    icon: "flag-outline",
    refs: ["Joshua 1:9", "Deuteronomy 31:6", "2 Timothy 1:7", "Psalm 27:1", "1 Corinthians 16:13"],
  },
  // These nine topics were rebuilt by searching every occurrence of each
  // topic's keyword family (heal*, pray*, fast*, faith/believe*,
  // righteous*, hate*, adulter*/fornication, etc.) against this project's
  // own bundled KJV text (src/data/bible-kjv.json), not just recalled from
  // memory — see the scratchpad search script used while building this —
  // then kept every distinct teaching/promise/instruction verse. Pure
  // repeated narrative refrains (e.g. dozens of near-identical "and he
  // healed them" summaries, or Ezekiel's extended whoredom metaphor for
  // Israel's idolatry) aren't each listed separately, and a couple of
  // richly unified chapters are cited whole (Hebrews 11, Psalm 1) rather
  // than verse-by-verse. For faith, righteousness, and prayer specifically
  // — three of Scripture's most pervasive themes — a literal list of every
  // single occurrence would run into the hundreds and stop being
  // readable; the lists below are deliberately curated for breadth and
  // teaching value there. See bibleReadingPlans.studySectionIntro for how
  // this is described in the app itself.
  healing: {
    id: "healing",
    category: "study",
    icon: "medkit-outline",
    refs: [
      "Genesis 20:17", "Exodus 15:26", "Numbers 12:13", "Deuteronomy 32:39", "2 Kings 20:5",
      "2 Chronicles 7:14", "2 Chronicles 30:20", "Psalm 6:2", "Psalm 30:2", "Psalm 41:4",
      "Psalm 103:2-3", "Psalm 107:20", "Psalm 147:3", "Proverbs 3:8", "Proverbs 4:20-22",
      "Proverbs 12:18", "Proverbs 16:24", "Proverbs 17:22", "Isaiah 53:5", "Isaiah 57:18-19",
      "Isaiah 58:8", "Jeremiah 17:14", "Jeremiah 30:17", "Jeremiah 33:6", "Hosea 6:1",
      "Hosea 14:4", "Malachi 4:2", "Matthew 4:23-24", "Matthew 8:16-17", "Matthew 9:35",
      "Mark 5:34", "Luke 4:18", "Luke 5:15", "Luke 6:17-19", "Acts 3:1-11",
      "Acts 10:38", "Acts 28:8-9", "1 Corinthians 12:9", "James 5:14-16", "1 Peter 2:24",
      "Revelation 22:1-2", "3 John 1:2",
    ],
  },
  longLife: {
    id: "longLife",
    category: "study",
    icon: "infinite-outline",
    refs: [
      "Genesis 15:15", "Genesis 25:8", "Exodus 20:12", "Deuteronomy 4:40", "Deuteronomy 5:16",
      "Deuteronomy 5:33", "Deuteronomy 6:2", "Deuteronomy 11:9", "Deuteronomy 30:19-20", "Deuteronomy 32:47",
      "1 Kings 3:11-14", "1 Chronicles 29:28", "Job 5:26", "Job 12:12", "Psalm 21:4",
      "Psalm 34:12-14", "Psalm 71:9", "Psalm 90:10-12", "Psalm 91:16", "Psalm 92:14",
      "Proverbs 3:1-2", "Proverbs 3:16", "Proverbs 4:10", "Proverbs 9:10-11", "Proverbs 10:27",
      "Ecclesiastes 8:12-13", "Isaiah 46:4", "Isaiah 53:10", "Ephesians 6:2-3",
    ],
  },
  prayer: {
    id: "prayer",
    category: "study",
    icon: "hand-right-outline",
    refs: [
      "Matthew 6:6", "Matthew 6:9-13", "Matthew 7:7-8", "Matthew 18:19-20", "Matthew 21:22",
      "Mark 11:24-25", "Luke 11:1-13", "Luke 18:1-8", "John 14:13-14", "John 15:7",
      "John 16:23-24", "Acts 1:14", "Romans 8:26-27", "Ephesians 6:18", "Philippians 4:6-7",
      "Colossians 4:2", "1 Timothy 2:1-4", "1 Thessalonians 5:17", "Hebrews 4:16", "James 4:2-3",
      "James 5:13-16", "1 John 5:14-15", "1 Peter 3:12", "Psalm 145:18", "Psalm 86:1-7",
      "Daniel 9:17-19",
    ],
  },
  fasting: {
    id: "fasting",
    category: "study",
    icon: "nutrition-outline",
    refs: [
      "Judges 20:26", "1 Samuel 7:6", "1 Samuel 31:13", "2 Samuel 1:12", "2 Samuel 12:16-23",
      "1 Kings 21:27", "2 Chronicles 20:3-4", "Ezra 8:21-23", "Nehemiah 1:4", "Nehemiah 9:1",
      "Esther 4:3", "Esther 4:16", "Psalm 35:13", "Psalm 69:10", "Psalm 109:24",
      "Isaiah 58:3-7", "Jeremiah 14:12", "Daniel 6:18", "Daniel 9:3", "Joel 1:14",
      "Joel 2:12-13", "Joel 2:15", "Jonah 3:5", "Zechariah 7:5", "Zechariah 8:19",
      "Matthew 4:1-2", "Matthew 6:16-18", "Matthew 9:14-15", "Matthew 17:21", "Mark 9:29",
      "Luke 5:33-35", "Luke 18:12", "Acts 13:2-3", "Acts 14:23", "1 Corinthians 7:5",
    ],
  },
  faith: {
    id: "faith",
    category: "study",
    icon: "telescope-outline",
    refs: [
      "Hebrews 11", "Romans 4", "Romans 1:16-17", "Romans 5:1", "Romans 10:17",
      "Romans 14:23", "2 Corinthians 4:18", "2 Corinthians 5:7", "Galatians 2:20", "Galatians 3:6-9",
      "Ephesians 2:8-9", "Matthew 17:20", "Matthew 21:21-22", "Mark 9:23-24", "Mark 11:22-24",
      "Luke 17:5-6", "James 1:5-6", "James 2:14-26", "1 Peter 1:7", "1 John 5:4",
      "Habakkuk 2:4",
    ],
  },
  righteousness: {
    id: "righteousness",
    category: "study",
    icon: "scale-outline",
    refs: [
      "Psalm 1", "Matthew 5:6", "Matthew 6:33", "Romans 3:10", "Romans 3:21-26",
      "Romans 4:3-5", "Romans 5:17", "Romans 6:13", "2 Corinthians 5:21", "Philippians 1:11",
      "Philippians 3:9", "1 Corinthians 1:30", "Psalm 34:15", "Proverbs 4:18", "Proverbs 10:2",
      "Proverbs 11:18-19", "Proverbs 12:28", "Proverbs 14:34", "Proverbs 21:21", "Isaiah 32:17",
      "Isaiah 61:10", "Isaiah 64:6", "Jeremiah 23:5-6", "2 Timothy 3:16", "1 John 3:7",
      "2 Peter 3:13",
    ],
  },
  anxiety: {
    id: "anxiety",
    category: "life",
    icon: "cloudy-outline",
    refs: ["Matthew 6:25-27", "1 Peter 5:7", "Psalm 55:22", "Matthew 11:28-30", "Isaiah 41:10"],
  },
  grief: {
    id: "grief",
    category: "life",
    icon: "rainy-outline",
    refs: ["Psalm 34:18", "Matthew 5:4", "Revelation 21:3-4", "John 11:25-26", "2 Corinthians 1:3-4"],
  },
  waiting: {
    id: "waiting",
    category: "life",
    icon: "hourglass-outline",
    refs: ["Isaiah 40:31", "Psalm 27:14", "Lamentations 3:25-26", "Psalm 37:7", "Habakkuk 2:3"],
  },
  doubt: {
    id: "doubt",
    category: "life",
    icon: "help-circle-outline",
    refs: ["Mark 9:23-24", "James 1:5-6", "Matthew 14:29-31", "John 20:27-29", "Proverbs 3:5-6"],
  },
  weariness: {
    id: "weariness",
    category: "life",
    icon: "battery-dead-outline",
    refs: ["Isaiah 40:28-29", "Exodus 33:14", "Psalm 23:1-3", "2 Corinthians 12:9-10", "Jeremiah 31:25"],
  },
  // The next three are longer and split in two via remedyStartsAtDay:
  // refs before that day number are what Scripture says the danger is;
  // from that day on, God's remedy. BibleReadingPlansScreen renders a
  // small header above each half.
  anger: {
    id: "anger",
    category: "life",
    icon: "flame-outline",
    remedyStartsAtDay: 14,
    refs: [
      "Proverbs 14:17", "Proverbs 14:29", "Proverbs 15:18", "Proverbs 20:2", "Proverbs 21:19",
      "Proverbs 22:24-25", "Proverbs 25:23", "Proverbs 27:4", "Proverbs 29:22", "Ecclesiastes 5:6",
      "Ecclesiastes 7:9", "James 1:19-20", "Galatians 5:19-20",
      "Psalm 37:8", "Proverbs 15:1", "Proverbs 16:32", "Proverbs 19:11", "Matthew 5:22-24",
      "Ephesians 4:26-27", "Ephesians 4:31-32", "Colossians 3:8", "Colossians 3:21", "Titus 1:7",
      "Romans 12:19-21",
    ],
  },
  hatred: {
    id: "hatred",
    category: "life",
    icon: "thunderstorm-outline",
    remedyStartsAtDay: 14,
    refs: [
      "Leviticus 19:17", "Proverbs 10:12", "Proverbs 10:18", "Proverbs 15:17", "Proverbs 26:24",
      "Proverbs 26:28", "Ecclesiastes 3:8", "Ecclesiastes 9:6", "Galatians 5:19-21", "Titus 3:3",
      "1 John 2:9-11", "1 John 3:15", "1 John 4:20",
      "Matthew 5:43-44", "Luke 6:27-28", "Romans 12:20-21", "1 John 4:7-8", "1 Peter 4:8",
      "1 Corinthians 13:4-7", "Colossians 3:12-14",
    ],
  },
  sexualPurity: {
    id: "sexualPurity",
    category: "life",
    icon: "lock-closed-outline",
    remedyStartsAtDay: 22,
    refs: [
      "Exodus 20:14", "Proverbs 5:3-5", "Proverbs 6:26", "Proverbs 6:32", "Job 31:1",
      "Malachi 3:5", "Matthew 5:27-28", "Matthew 15:19", "Acts 15:20", "1 Corinthians 5:1",
      "1 Corinthians 6:9-10", "1 Corinthians 6:18", "1 Corinthians 7:2", "1 Corinthians 10:8", "Galatians 5:19-21",
      "Ephesians 5:3", "Colossians 3:5", "1 Thessalonians 4:3-5", "Hebrews 13:4", "James 4:4",
      "Jude 1:7",
      "John 8:3-11", "1 Corinthians 6:19-20", "1 Corinthians 6:13", "1 Corinthians 10:13", "2 Timothy 2:22",
      "Psalm 119:9-11", "Galatians 5:16", "Romans 13:14", "1 Peter 2:11",
    ],
  },
};
