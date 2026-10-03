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
  "purposeOfLife",
  "salvation",
  "lifeAfterDeath",
  "whenBadThingsHappen",
  "assurance",
  "everySeason",
  "wisdom",
  "walkingWithGod",
  "repentance",
  "identity",
  "marriageAndSingleness",
  "lovingOthers",
  "betrayal",
  "brokennessAndStrength",
  "fearNot",
  "depression",
  "healingFromThePast",
  "changeAndTransition",
  "newBeginnings",
  "perseverance",
  "diligence",
  "workAndPlanning",
  "blessingAndRiches",
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
  // The 23 topics below answer the wider range of questions and seasons a
  // life actually holds — not just the temptations and doctrines above,
  // but purpose, doubt, loss, identity, work, marriage, money, and what
  // happens after death. Unlike the keyword-searched topics above, these
  // are curated: there's no single word to search for "the meaning of
  // life" the way there is for "heal" or "pray," so each list is a
  // substantial, deliberately chosen cross-section rather than a claim of
  // completeness. Together they're built to do what 2 Timothy 3:16-17
  // says Scripture itself is for — doctrine, reproof, correction, and
  // instruction in righteousness — and to leave a reader more hopeful,
  // not less, for having read them. A few verses recur across two or
  // three related topics (e.g. Psalm 34:18, 2 Corinthians 5:17) where the
  // same promise genuinely speaks to more than one situation.
  purposeOfLife: {
    id: "purposeOfLife",
    category: "study",
    icon: "compass-outline",
    refs: [
      "Ecclesiastes 12:13", "Colossians 1:16", "Romans 11:36", "1 Corinthians 10:31", "Isaiah 43:7",
      "Jeremiah 29:11", "Ephesians 2:10", "Psalm 139:13-16", "Revelation 4:11", "Micah 6:8",
      "Matthew 22:37-39", "John 10:10",
    ],
  },
  salvation: {
    id: "salvation",
    category: "study",
    icon: "key-outline",
    refs: [
      "John 3:16", "Romans 3:23", "Romans 6:23", "Romans 5:8", "Romans 10:9-10",
      "Romans 10:13", "Ephesians 2:8-9", "Acts 4:12", "Titus 3:5", "1 John 5:11-13",
      "John 14:6",
    ],
  },
  lifeAfterDeath: {
    id: "lifeAfterDeath",
    category: "study",
    icon: "planet-outline",
    refs: [
      "Ecclesiastes 12:7", "2 Corinthians 5:1", "2 Corinthians 5:8", "Philippians 1:21-23", "John 11:25-26",
      "1 Thessalonians 4:13-14", "1 Thessalonians 4:16-18", "1 Corinthians 15:51-57", "Hebrews 9:27", "Revelation 21:1-4",
      "Luke 23:43", "Psalm 23:6",
    ],
  },
  whenBadThingsHappen: {
    id: "whenBadThingsHappen",
    category: "study",
    icon: "help-buoy-outline",
    refs: [
      "Genesis 50:20", "Romans 8:28", "Job 1:20-22", "Job 42:1-6", "Habakkuk 3:17-19",
      "John 9:1-3", "2 Corinthians 4:17-18", "1 Peter 1:6-7", "Romans 5:3-5", "Isaiah 55:8-9",
      "Deuteronomy 29:29", "Nahum 1:7",
    ],
  },
  assurance: {
    id: "assurance",
    category: "study",
    icon: "shield-outline",
    refs: [
      "Deuteronomy 31:6", "Isaiah 41:10", "Psalm 34:18", "Psalm 145:18", "Matthew 28:20",
      "Hebrews 13:5", "Psalm 23:1-4", "Isaiah 43:2", "Zephaniah 3:17", "1 Peter 5:7",
      "Psalm 46:1", "Romans 8:38-39",
    ],
  },
  everySeason: {
    id: "everySeason",
    category: "study",
    icon: "sync-outline",
    refs: [
      "Ecclesiastes 3", "Ecclesiastes 7:14", "Philippians 4:11-13", "Romans 12:15", "Psalm 30:5",
      "James 1:2-4", "1 Thessalonians 5:16-18", "Lamentations 3:22-23", "Job 2:10", "2 Corinthians 6:10",
    ],
  },
  wisdom: {
    id: "wisdom",
    category: "study",
    icon: "bulb-outline",
    refs: [
      "James 1:5", "Proverbs 2:1-6", "Proverbs 3:5-7", "Proverbs 4:7", "Proverbs 9:10",
      "1 Kings 3:9", "Colossians 2:2-3", "Ephesians 1:17", "Daniel 2:20-22", "Proverbs 1:7",
      "Ecclesiastes 7:12", "2 Peter 1:5-8",
    ],
  },
  walkingWithGod: {
    id: "walkingWithGod",
    category: "study",
    icon: "walk-outline",
    refs: [
      "2 Peter 3:18", "John 15:4-5", "Colossians 2:6-7", "Philippians 1:6", "Hebrews 11:6",
      "1 Thessalonians 4:1", "Colossians 1:10", "2 Corinthians 5:9", "Romans 12:1-2", "Ephesians 4:15",
      "Genesis 5:24", "1 John 2:6",
    ],
  },
  repentance: {
    id: "repentance",
    category: "study",
    icon: "arrow-undo-outline",
    refs: [
      "1 John 1:9", "Psalm 51:1-4", "Psalm 51:10", "Psalm 51:17", "Proverbs 28:13",
      "Acts 3:19", "2 Chronicles 7:14", "Isaiah 1:18", "James 5:16", "Luke 15",
      "2 Corinthians 7:10",
    ],
  },
  identity: {
    id: "identity",
    category: "study",
    icon: "person-outline",
    refs: [
      "Psalm 139:13-14", "Jeremiah 1:5", "Genesis 1:27", "2 Corinthians 5:17", "1 Samuel 16:7",
      "Judges 6:12-16", "Exodus 3:11-12", "Jeremiah 1:6-8", "1 Corinthians 1:27-29", "Galatians 2:20",
      "Romans 8:37", "1 John 3:1",
    ],
  },
  marriageAndSingleness: {
    id: "marriageAndSingleness",
    category: "study",
    icon: "people-outline",
    refs: [
      "Genesis 2:18", "Genesis 2:24", "Proverbs 18:22", "Proverbs 31:10-12", "Proverbs 31:30-31",
      "Ephesians 5:22-25", "Ephesians 5:31-33", "Colossians 3:18-19", "1 Peter 3:1-2", "1 Peter 3:7",
      "Hebrews 13:4", "1 Corinthians 7:7-9", "1 Corinthians 7:32-35", "Matthew 19:4-6",
    ],
  },
  lovingOthers: {
    id: "lovingOthers",
    category: "study",
    icon: "people-circle-outline",
    refs: [
      "Romans 12:10", "Romans 12:16", "Romans 15:7", "Galatians 6:2", "Ephesians 4:2-3",
      "Ephesians 4:32", "Colossians 3:12-14", "1 Thessalonians 5:11", "Hebrews 10:24-25", "1 Peter 4:8-10",
      "1 Peter 3:8", "Proverbs 27:17",
    ],
  },
  betrayal: {
    id: "betrayal",
    category: "study",
    icon: "sad-outline",
    refs: [
      "Psalm 41:9", "Psalm 55:12-14", "Genesis 50:15-21", "Luke 22:47-48", "Matthew 26:49-50",
      "Romans 12:19", "1 Peter 2:23", "Psalm 27:10", "Micah 7:5-7", "Job 19:19",
      "2 Timothy 4:16-17",
    ],
  },
  brokennessAndStrength: {
    id: "brokennessAndStrength",
    category: "study",
    icon: "construct-outline",
    refs: [
      "Psalm 34:18", "Psalm 51:17", "Isaiah 61:1-3", "2 Corinthians 12:9-10", "Isaiah 40:29",
      "Psalm 73:26", "2 Corinthians 4:7-9", "Philippians 4:13", "Nehemiah 8:10", "Psalm 147:3",
      "Matthew 5:3-4",
    ],
  },
  fearNot: {
    id: "fearNot",
    category: "study",
    icon: "flash-outline",
    refs: [
      "Isaiah 41:10", "Isaiah 41:13", "Isaiah 43:1-3", "Psalm 56:3", "Psalm 118:6",
      "1 John 4:18", "Matthew 10:28-31", "Proverbs 29:25", "Psalm 34:4", "Mark 5:36",
      "Luke 12:32",
    ],
  },
  depression: {
    id: "depression",
    category: "study",
    icon: "moon-outline",
    refs: [
      "Psalm 42:5", "Psalm 42:11", "Psalm 43:5", "1 Kings 19:3-5", "1 Kings 19:11-12",
      "Psalm 34:17-18", "Lamentations 3:19-24", "2 Corinthians 1:8-9", "2 Corinthians 4:8-9", "Psalm 40:1-3",
      "Psalm 30:5",
    ],
  },
  healingFromThePast: {
    id: "healingFromThePast",
    category: "study",
    icon: "bandage-outline",
    refs: [
      "Isaiah 61:1-3", "Joel 2:25", "Psalm 147:3", "2 Corinthians 5:17", "Romans 12:2",
      "Philippians 3:13-14", "Isaiah 43:18-19", "Psalm 34:18", "Genesis 50:20", "Ruth 1:20-21",
      "Ruth 4:14-15",
    ],
  },
  changeAndTransition: {
    id: "changeAndTransition",
    category: "study",
    icon: "swap-horizontal-outline",
    refs: [
      "Genesis 12:1", "Job 1:21", "Genesis 8:22", "Proverbs 16:9", "James 4:13-15",
      "Hebrews 13:8", "Romans 8:28", "Psalm 31:15", "Daniel 2:21", "Isaiah 40:8",
    ],
  },
  newBeginnings: {
    id: "newBeginnings",
    category: "study",
    icon: "partly-sunny-outline",
    refs: [
      "Joel 2:25", "Isaiah 43:18-19", "Philippians 3:13-14", "Lamentations 3:22-23", "2 Corinthians 5:17",
      "Micah 7:8", "Proverbs 24:16", "Job 42:10-12", "Luke 15:20-24", "Psalm 71:20-21",
      "Revelation 21:5",
    ],
  },
  perseverance: {
    id: "perseverance",
    category: "study",
    icon: "trending-up-outline",
    refs: [
      "Galatians 6:9", "Hebrews 12:1-3", "James 1:12", "1 Corinthians 15:58", "Isaiah 40:31",
      "Philippians 1:6", "Hebrews 10:35-36", "Luke 18:1", "James 5:7-8", "2 Chronicles 15:7",
      "Ecclesiastes 11:1", "Psalm 126:5-6",
    ],
  },
  // Danger/remedy split like anger/hatred/sexualPurity below: laziness's
  // warnings first, then Scripture's call to diligence.
  diligence: {
    id: "diligence",
    category: "study",
    icon: "hammer-outline",
    remedyStartsAtDay: 11,
    refs: [
      "Proverbs 6:6-11", "Proverbs 10:4", "Proverbs 12:24", "Proverbs 13:4", "Proverbs 15:19",
      "Proverbs 19:15", "Proverbs 20:4", "Proverbs 24:30-34", "Proverbs 26:13-16", "Ecclesiastes 10:18",
      "Proverbs 10:5", "Proverbs 12:11", "Proverbs 14:23", "Proverbs 21:5", "Proverbs 22:29",
      "Proverbs 27:23", "Colossians 3:23-24", "2 Thessalonians 3:10-12", "Romans 12:11", "Ecclesiastes 9:10",
    ],
  },
  workAndPlanning: {
    id: "workAndPlanning",
    category: "study",
    icon: "briefcase-outline",
    refs: [
      "Proverbs 16:3", "Proverbs 16:9", "Proverbs 15:22", "Proverbs 21:5", "Proverbs 24:3-4",
      "Luke 14:28-30", "Ecclesiastes 2:24", "James 4:13-15", "Psalm 90:17", "Proverbs 3:5-6",
      "1 Corinthians 3:6-9",
    ],
  },
  blessingAndRiches: {
    id: "blessingAndRiches",
    category: "study",
    icon: "diamond-outline",
    refs: [
      "Malachi 3:10", "Psalm 23:1", "Philippians 4:19", "Proverbs 10:22", "John 10:10",
      "Ephesians 3:20", "2 Corinthians 9:8", "Joshua 1:8", "Matthew 6:33", "Luke 6:38",
      "1 Timothy 6:6-10", "1 Timothy 6:17-19", "Proverbs 30:8-9",
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
