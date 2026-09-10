// "Barnabas Heart" topical reading plans — short (5-day) mini reading
// plans grouped into two categories:
//   - "quality": the Christlike qualities that defined Barnabas himself
//     (Acts 4:36, 11:22-24) — encouragement, love, peace, forgiveness,
//     hope, humility, generosity, faithfulness, joy, courage.
//   - "life": the everyday struggles a Barnabas-hearted reader is likely
//     walking through, or walking alongside someone else through —
//     anxiety, grief, waiting, doubt, weariness.
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
  "anxiety",
  "grief",
  "waiting",
  "doubt",
  "weariness",
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
};
