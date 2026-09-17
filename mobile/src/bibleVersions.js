// Multi-version full-Bible download & cache for the chapter reader and
// Bible browser. Only KJV ships bundled with the app (~4MB, see
// bibleLookup.js) — the other 7 translations' full text live as static
// JSON in this repo's own bible-data/ folder and are fetched on first
// use from raw.githubusercontent.com, then written to this device's
// filesystem so later reads work fully offline without re-downloading.
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { BIBLE_VERSIONS } from "./data/verses";
import KJV_TEXT from "./data/bible-kjv.json";

const BIBLE_DATA_BASE_URL =
  "https://raw.githubusercontent.com/Arthurdongz/MyApp-Creation/claude/barnabas-journal-app-xxz25d/bible-data/";

// expo-file-system's directories are unavailable on web (react-native-web)
// — there, just keep whatever's been fetched in memory for the session
// rather than trying to persist it.
const CACHE_DIR = Platform.OS !== "web" && FileSystem.documentDirectory ? `${FileSystem.documentDirectory}bible-data/` : null;

const textCache = { KJV: KJV_TEXT };
const loadPromises = {};

export function getVersionMeta(id) {
  return BIBLE_VERSIONS.find((v) => v.id === id) || { id, name: id };
}

export function isVersionLoaded(id) {
  return !!textCache[id];
}

// Synchronous cache read — lets callers avoid flashing a loading state
// for a version (e.g. KJV) that's already in memory.
export function getCachedVersionText(id) {
  return textCache[id] || null;
}

async function ensureCacheDir() {
  if (!CACHE_DIR) return;
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

// Downloads (or loads an already-downloaded copy of) a version's full
// text, parses it, and caches the parsed array in memory for the rest of
// this session. Concurrent calls for the same version share one fetch.
export async function loadVersionText(id) {
  if (textCache[id]) return textCache[id];
  if (loadPromises[id]) return loadPromises[id];

  const promise = (async () => {
    const url = `${BIBLE_DATA_BASE_URL}${id}.json`;
    let raw;
    if (CACHE_DIR) {
      await ensureCacheDir();
      const localUri = `${CACHE_DIR}${id}.json`;
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists) {
        raw = await FileSystem.readAsStringAsync(localUri);
      } else {
        const result = await FileSystem.downloadAsync(url, localUri);
        if (result.status !== 200) {
          await FileSystem.deleteAsync(localUri, { idempotent: true });
          throw new Error(`Failed to download ${id} (status ${result.status})`);
        }
        raw = await FileSystem.readAsStringAsync(localUri);
      }
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to download ${id}`);
      raw = await response.text();
    }
    const data = JSON.parse(raw);
    textCache[id] = data;
    return data;
  })();

  loadPromises[id] = promise;
  try {
    return await promise;
  } finally {
    delete loadPromises[id];
  }
}
