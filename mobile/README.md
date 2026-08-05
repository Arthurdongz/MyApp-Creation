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

## Android share shortcut

Long-pressing the launcher icon on Android offers a "Share Verse" shortcut
that jumps straight to sharing today's verse, skipping the app's normal
navigation. It's a static shortcut defined by `plugins/withShareShortcut.js`
(a config plugin, since this project has no checked-in `android/` folder —
`eas build` regenerates it fresh via `expo prebuild` every time). The
shortcut opens the `barnabas-journal://share-today` deep link; `App.js`
listens for it and calls `Share.share()` with today's verse text. Like any
new config plugin, this only takes effect after a fresh `eas build` — it
won't reach devices via an OTA update.

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

## Distributing the APK before a Play Store listing exists

The web app (repo root) shows a "Download for Android" banner to anyone visiting on
an Android browser, linking to:

```
https://github.com/Arthurdongz/MyApp-Creation/releases/latest/download/barnabas-journal.apk
```

GitHub resolves `/releases/latest/download/<filename>` to that exact filename on
whichever release was most recently published — so the link itself never needs to
change, as long as every release you publish includes an asset with this exact name:
`barnabas-journal.apk`.

After each `eas build --platform android --profile preview`:
1. Download the built APK from the link/QR code `eas build` gives you.
2. Rename it to `barnabas-journal.apk` if it isn't already.
3. On GitHub: **Releases** → **Draft a new release**.
4. Pick a new tag (e.g. bump to match `app.json`'s `version`, like `v1.1.0`) — the tag
   itself doesn't matter to the download link, only that this release is the most
   recently published one.
5. Drag `barnabas-journal.apk` into the release's asset upload area.
6. Leave "Set as the latest release" checked, and make sure it's **not** marked as a
   draft or pre-release (only a fully published, non-prerelease release counts as
   "latest").
7. Publish. The banner's link on the web app now points at this build automatically —
   no code change needed.
