// Lazily loads the language-specific variant of each multi-locale content
// bank (confessions, encouragements, moments, quotes, stories, highlights,
// journal prompts, welcome teasers), instead of every screen that uses one
// of these banks statically importing all 4 languages of it. A plain
// `import` always runs at module-load time regardless of whether it's
// used; `require()` only runs when the call site actually executes, so
// only the ~300-plus-entry bank the device's language needs gets parsed —
// not the other three languages' worth of the same content, on every cold
// start, for every user. Device language never changes mid-session (there's
// no in-app language switcher — see i18n/index.js), so each loader caches
// its result after the first call, the same idea as data/kjvText.js uses
// for the much larger KJV bundle.
function makeLoader(loadEnglish, loadEs, loadPt, loadFr) {
  let cached = null;
  let cachedLang = null;
  return function load(lang) {
    if (cached && cachedLang === lang) return cached;
    switch (lang) {
      case "es":
        cached = loadEs();
        break;
      case "pt":
        cached = loadPt();
        break;
      case "fr":
        cached = loadFr();
        break;
      default:
        cached = loadEnglish();
        break;
    }
    cachedLang = lang;
    return cached;
  };
}

export const loadConfessions = makeLoader(
  () => require("./confessions").CONFESSIONS,
  () => require("./confessions.es").CONFESSIONS_ES,
  () => require("./confessions.pt").CONFESSIONS_PT,
  () => require("./confessions.fr").CONFESSIONS_FR
);

export const loadEncouragements = makeLoader(
  () => require("./encouragements").ENCOURAGEMENTS,
  () => require("./encouragements.es").ENCOURAGEMENTS_ES,
  () => require("./encouragements.pt").ENCOURAGEMENTS_PT,
  () => require("./encouragements.fr").ENCOURAGEMENTS_FR
);

export const loadMoments = makeLoader(
  () => require("./moments").BARNABAS_MOMENTS,
  () => require("./moments.es").BARNABAS_MOMENTS_ES,
  () => require("./moments.pt").BARNABAS_MOMENTS_PT,
  () => require("./moments.fr").BARNABAS_MOMENTS_FR
);

export const loadStories = makeLoader(
  () => require("./stories").STORIES,
  () => require("./stories.es").STORIES_ES,
  () => require("./stories.pt").STORIES_PT,
  () => require("./stories.fr").STORIES_FR
);

export const loadHighlights = makeLoader(
  () => require("./highlights").HIGHLIGHTS,
  () => require("./highlights.es").HIGHLIGHTS_ES,
  () => require("./highlights.pt").HIGHLIGHTS_PT,
  () => require("./highlights.fr").HIGHLIGHTS_FR
);

export const loadJournalPrompts = makeLoader(
  () => require("./journalPrompts").JOURNAL_PROMPTS,
  () => require("./journalPrompts.es").JOURNAL_PROMPTS_ES,
  () => require("./journalPrompts.pt").JOURNAL_PROMPTS_PT,
  () => require("./journalPrompts.fr").JOURNAL_PROMPTS_FR
);

export const loadWelcomeTeasers = makeLoader(
  () => require("./welcomeTeasers").WELCOME_TEASERS,
  () => require("./welcomeTeasers.es").WELCOME_TEASERS_ES,
  () => require("./welcomeTeasers.pt").WELCOME_TEASERS_PT,
  () => require("./welcomeTeasers.fr").WELCOME_TEASERS_FR
);

// Quotes are the one exception: the English bank isn't its own quotes.js
// file — it's derived from wisdom.js's quote-type entries (wisdom.js also
// holds legacy "story"-type entries nothing reads anymore — see
// TodayScreen.js's history). Deriving it lazily here means wisdom.js's
// ~67KB only gets parsed for English/unrecognized-language sessions, not
// es/pt/fr ones, which have their own dedicated quotes.*.js instead.
export const loadQuotes = makeLoader(
  () => require("./wisdom").WISDOM.filter((w) => w.type === "quote"),
  () => require("./quotes.es").QUOTES_ES,
  () => require("./quotes.pt").QUOTES_PT,
  () => require("./quotes.fr").QUOTES_FR
);
