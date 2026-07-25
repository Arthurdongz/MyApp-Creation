# Barnabas Journal (Mobile / Expo)

A React Native rewrite of the Barnabas Journal app, built with Expo, for iOS and Android.

This is a native port of the web app at the repo root — same content banks (366 unique
scripture verses, encouragements, Barnabas-moment prompts, and wisdom quotes/stories, one
per day of the year with no repeats), same features, same calming design.

## Running it

```bash
cd mobile
npm install
npx expo start
```

Then:
- Press `w` to open in a browser (uses `react-native-web`)
- Press `i` for iOS Simulator (macOS only) or `a` for Android Emulator
- Or scan the QR code with the Expo Go app on your phone

## Structure

- `App.js` — root component: header, tab switcher, safe-area handling
- `src/theme.js` — shared color palette
- `src/content.js` — day-of-year indexing logic (shared with the web version's approach)
- `src/storage.js` — journal state, `AsyncStorage` persistence, and rewards/streak/badge logic
- `src/data/` — the four 366-entry content banks (verses, encouragements, moments, wisdom)
- `src/screens/` — `TodayScreen`, `HistoryScreen`, `RewardsScreen`
- `src/components/Card.js` — shared card container

## Data & privacy

Journal entries, moods, stars, and streaks are stored on-device via
`@react-native-async-storage/async-storage`. Nothing is sent to a server.
