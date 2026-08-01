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

## Over-the-air updates

Pushes to this branch that touch `mobile/**` automatically publish an EAS Update
to the `preview` channel via `.github/workflows/eas-update.yml`. Installed builds
on the `preview` channel pick up JS/asset changes on next launch — no rebuild or
reinstall needed, as long as the change doesn't require new native code.

Requires an `EXPO_TOKEN` repo secret (Settings > Secrets and variables > Actions),
generated from an Expo access token at https://expo.dev/settings/access-tokens.

**⚠️ Before adding or upgrading anything with native code** (a new package with an
`android/`/`ios/` folder, a new Expo config plugin, upgrading Expo SDK itself): bump
`version` in `app.json` (and `android.versionCode`) in the *same* commit. This
project's `runtimeVersion.policy` is `"appVersion"`, so EAS Update ties compatibility
to that version string — if it isn't bumped, the auto-publish workflow will happily
push JS that references the new native module to every already-installed binary that
doesn't have it, crashing the app on launch. (This happened once — see the "Fix
app-crashing OTA update" commit.) After bumping, existing installs simply won't be
offered that update until they're rebuilt with `eas build`; only a fresh build
actually gets the new native code.
