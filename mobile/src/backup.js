// Export/import a full backup of the journal as a JSON file, using the
// native share sheet (export) and document picker (import) since everything
// otherwise lives only in this device's AsyncStorage.

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { todayKey, isValidOrder } from "./content";

export async function exportBackup(state) {
  const payload = { app: "barnabas-journal", schema: 2, exportedAt: new Date().toISOString(), state };
  const fileName = `barnabas-journal-backup-${todayKey()}.json`;
  const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const uri = dir + fileName;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Save your Barnabas Journal backup" });
  }
  return uri;
}

export async function pickAndReadBackup() {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });

  // expo-document-picker's result shape has changed across SDK versions —
  // support both the newer { canceled, assets } and the classic
  // { type: 'success', uri } forms.
  let asset = null;
  if (result && Array.isArray(result.assets) && result.assets.length > 0) {
    if (result.canceled) return null;
    asset = result.assets[0];
  } else if (result && result.type === "success") {
    asset = result;
  }
  if (!asset) return null;

  // On web there's no real filesystem path to read from (the uri is a
  // blob: URL FileSystem can't open) — the picker hands back the actual
  // browser File object instead, so read it directly when present.
  let content;
  if (asset.file && typeof asset.file.text === "function") {
    content = await asset.file.text();
  } else {
    content = await FileSystem.readAsStringAsync(asset.uri);
  }

  const parsed = JSON.parse(content);
  const incoming = parsed.state || parsed;
  if (!incoming.journeyStartDate || !isValidOrder(incoming.order)) {
    throw new Error("That file doesn't look like a valid Barnabas Journal backup.");
  }
  return incoming;
}
