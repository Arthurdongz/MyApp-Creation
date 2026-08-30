// Talks to the Cloudflare Worker proxy in chat-worker/ — see that
// directory's README for deploy steps. The Worker holds the Anthropic API
// key server-side (it can't safely live in the app bundle) and forwards
// messages to Claude.
export const CHAT_WORKER_URL = "https://barnabas-chat.barnabas-journal.workers.dev";

import AsyncStorage from "@react-native-async-storage/async-storage";

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

// region is the resolved crisis region (see crisisResources.resolveCrisisRegion)
// so the Worker's system prompt can cite the right crisis line instead of
// always defaulting to US resources — the caller resolves it since only it
// knows about a user's Settings override.
//
// todayContext and personalization are optional, structured summaries the
// Worker folds into its system prompt (see chat-worker/worker.js) so
// Barnabas can reference today's actual story/moment/verse instead of
// guessing from memory, and lightly personalize using the user's own
// streak/mood/moments-done — never their raw journal text, which stays on
// the device unless they choose to type it into the chat themselves.
export async function sendChatMessage(message, history, language, region, todayContext, personalization) {
  const deviceId = await getOrCreateChatDeviceId();
  let res;
  try {
    res = await fetch(CHAT_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, deviceId, region, language, todayContext, personalization }),
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

// Fire-and-forget thumbs up/down on one Barnabas reply, for the developer
// to review later (see chat-worker/worker.js's /feedback handler and its
// README for how to read these back via wrangler) — never blocks or
// surfaces an error to the chat UI, since a failed feedback ping shouldn't
// interrupt the conversation itself.
export async function sendChatFeedback(userMessage, assistantMessage, feedback) {
  try {
    const deviceId = await getOrCreateChatDeviceId();
    await fetch(`${CHAT_WORKER_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, feedback, userMessage, assistantMessage }),
    });
  } catch (e) {
    // best-effort only
  }
}
