# Barnabas Journal

> "Joseph, who was also called by the apostles Barnabas (which means son of encouragement)..." — Acts 4:36

A calming daily journal app inspired by the life of Barnabas, built around one idea: a kind word or small act of encouragement can carry someone through a hard day.

## Features

- **Daily verse** — a different scripture each day chosen for hope, encouragement, and joy.
- **Daily encouragement** — a short, gentle statement for the day.
- **On Encouragement & Hope** — a rotating quote or short story about the power of kindness and hope.
- **Barnabas Moment** — a daily suggested act of kindness or encouragement you can do for someone else, with a one-tap "I did this today" check-in.
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

## Data & privacy

All journal entries, moods, stars, and streaks are stored only in your browser's `localStorage` (key `barnabasJournalState`). Nothing is sent anywhere — your reflections stay on your device.

## Files

- `index.html` — app markup
- `style.css` — calming visual design
- `content.js` — verse, encouragement, wisdom, and Barnabas-moment content banks, plus the daily rotation logic
- `app.js` — app state, rewards logic, and rendering
