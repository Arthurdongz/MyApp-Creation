// Talks to the Cloudflare Worker proxy in chat-worker/ — see that
// directory's README for deploy steps. The Worker holds the Anthropic API
// key server-side (it can't safely live in the app bundle) and forwards
// messages to Claude.
//
// IMPORTANT: replace this with the URL wrangler prints after `wrangler
// deploy` (looks like https://barnabas-chat.<your-subdomain>.workers.dev).
// The chat screen will show a clear error until this is set.
export const CHAT_WORKER_URL = "https://REPLACE-ME.workers.dev";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceRegionCode } from "./crisisResources";

const DEVICE_ID_KEY = "barnabasJournalChatDeviceIdV1";

// Not an account or identity — just a random per-install handle the Worker
// uses for its daily rate limit, so one device can't run up the API bill.
export async function getOrCreateChatDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export async function sendChatMessage(message, history) {
  const deviceId = await getOrCreateChatDeviceId();
  // Device region only (e.g. "US", "ES") — read from system locale, not
  // GPS — so the Worker's system prompt can cite the right crisis line
  // instead of always defaulting to US resources. See crisisResources.js.
  const region = getDeviceRegionCode();
  let res;
  try {
    res = await fetch(CHAT_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, deviceId, region }),
    });
  } catch (e) {
    throw new Error("Couldn't reach the chat server. Check your connection and try again.");
  }

  if (!res.ok) {
    if (res.status === 429) throw new Error("You've reached today's message limit — try again tomorrow.");
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch (e) {
      // non-JSON error body — fall through with no extra detail
    }
    throw new Error(detail || "Something went wrong reaching Barnabas. Please try again.");
  }

  const data = await res.json();
  return data.reply;
}
