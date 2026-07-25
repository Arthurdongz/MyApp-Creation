# Barnabas Journal

> "Joseph, who was also called by the apostles Barnabas (which means son of encouragement)..." — Acts 4:36

A calming daily journal app inspired by the life of Barnabas, built around one idea: a kind word or small act of encouragement can carry someone through a hard day.

## Features

- **Daily verse** — a different scripture every day of the year (366 verses, no repeats — including a leap day) chosen for hope, encouragement, and joy.
- **Daily encouragement** — a different short, gentle statement every day of the year.
- **On Encouragement & Hope** — a different quote or short story every day of the year about the power of kindness and hope.
- **Barnabas Moment** — a different suggested act of kindness every day of the year, with a one-tap "I did this today" check-in.
- **Reflection journal** — write freely about your day, record what you did as your Barnabas moment and how it felt, and pick a mood.
- **Rewards** — earn stars for showing up, completing your Barnabas moment, and journaling; build a daily streak; unlock badges (Seed of Encouragement, Growing in Grace, Barnabas Heart, Son of Encouragement, and streak badges).
- **My Journal** — a private history of everything you've written, most recent first.

## Design

The interface uses a soft, warm palette (sage green, cream, muted gold and blue) with rounded cards and gentle motion, intended to feel calm rather than gamified or urgent.

## Running it

This is a plain static site — no build step, no server, no external network calls.

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Content

Each of the four content banks (verses, encouragements, Barnabas moments, wisdom quotes/stories) has exactly 366 unique entries, indexed by day-of-year — so every calendar day gets its own content with no repeats within a year, including February 29 in leap years (that 366th entry is simply skipped in non-leap years, since day-of-year never reaches it).

The 366 scripture verses are drawn from across the whole Bible (Genesis through Revelation) using the public-domain King James Version (KJV). They were compiled from memory in an offline environment with no live Bible-database access — spot-check important ones against a Bible before relying on this beyond personal devotional use. The wisdom bank mixes well-known real quotes (carefully attributed, with "Unknown" used where the original author is uncertain) with original short vignette stories about kindness and hope.

## Data & privacy

All journal entries, moods, stars, and streaks are stored only in your browser's `localStorage` (key `barnabasJournalState`). Nothing is sent anywhere — your reflections stay on your device.

## Files

- `index.html` — app markup
- `style.css` — calming visual design
- `data-verses.js` — 366 scripture verses
- `data-encouragements.js` — 366 daily encouragement statements
- `data-moments.js` — 366 suggested Barnabas-moment kindness actions
- `data-wisdom.js` — 366 quotes/short stories on encouragement and hope
- `content.js` — shared day-of-year indexing logic
- `app.js` — app state, rewards logic, and rendering
