// Talks to the Cloudflare Worker proxy in chat-worker/ — see that
// directory's README for deploy steps. The Worker holds the Anthropic API
// key server-side (it can't safely live in the app bundle) and forwards
// messages to Claude.
export const CHAT_WORKER_URL = "https://barnabas-chat.barnabas-journal.workers.dev";

import AsyncStorage from "@react-native-async-storage/async-storage";
// expo/fetch (not the global RN fetch) gives a real ReadableStream body fed
// incrementally by native didReceiveResponseData events — required to
// stream the Worker's NDJSON response chunk-by-chunk instead of buffering
// the whole reply before returning it. See Expo SDK 57 docs before
// changing this — the streaming behavior here is version-specific.
import { fetch as expoFetch } from "expo/fetch";

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

// "Connect" bounds how long to wait for the request to resolve and for the
// first chunk of the reply body (whichever is slower to arrive, or a
// pre-flight network failure). "Stall" is re-armed on every chunk received
// after that, bounding only the *gap* between chunks — so one fixed overall
// deadline doesn't kill a reply that's legitimately just long.
const CONNECT_TIMEOUT_MS = 15000;
const STALL_TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reads the Worker's NDJSON stream (one {"type":"delta","text":...} or
// {"type":"error",...} object per line — see chat-worker/worker.js's
// createNdjsonStream), calling onDelta as text arrives and re-arming the
// caller's stall timeout on every chunk. Thrown errors carry
// `hasReceivedData`/`partialText` so sendChatMessage can decide whether a
// retry is safe (only ever before any data has come back) and, if not,
// hand back whatever text already streamed in rather than discarding it.
async function consumeChatStream(body, onDelta, resetStallTimeout) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let receivedData = false;

  while (true) {
    let chunk;
    try {
      chunk = await reader.read();
    } catch (e) {
      const err = new Error("The connection was interrupted. Please try again.");
      err.hasReceivedData = receivedData;
      err.partialText = fullText;
      throw err;
    }
    if (chunk.done) break;
    receivedData = true;
    resetStallTimeout();
    buffer += decoder.decode(chunk.value, { stream: true });

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (!line.trim()) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch (e) {
        continue; // malformed line — skip rather than aborting a reply that's otherwise fine
      }
      if (event.type === "delta" && typeof event.text === "string") {
        fullText += event.text;
        onDelta?.(event.text, fullText);
      } else if (event.type === "error") {
        const err = new Error(event.message || "Something went wrong reaching Barnabas. Please try again.");
        err.hasReceivedData = receivedData;
        err.partialText = fullText;
        throw err;
      }
    }
  }

  if (!fullText) {
    const err = new Error("Barnabas didn't send a reply. Please try again.");
    err.hasReceivedData = receivedData;
    throw err;
  }
  return fullText;
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
//
// personaPreferences ({ style, note }) is how the user's chosen "vibe" —
// friend/mentor/coach/etc., plus an optional free-text note — reaches the
// Worker's system prompt (see ChatPersonaModal and settings.chatPersonaStyle/
// chatPersonaNote). It's always sent, even at the default "friend" style,
// so the Worker has one consistent shape to sanitize.
//
// `onDelta(chunkText, fullTextSoFar)` fires as the reply streams in, so the
// caller can render it incrementally; the resolved promise still returns
// the complete text once the stream ends, same as before. A request is
// retried with backoff only when it fails before any reply data has come
// back (pure network/connect/stall-before-first-byte failure) — a
// definitive HTTP error is never retried, and neither is a failure after
// streaming has already started, since retrying then would risk showing
// duplicated or corrupted text for what the user already saw.
export async function sendChatMessage(
  message,
  history,
  language,
  region,
  todayContext,
  personalization,
  personaPreferences,
  { onDelta, signal: externalSignal } = {}
) {
  const deviceId = await getOrCreateChatDeviceId();

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);
    const resetStallTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
    };
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort);
    const cleanup = () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    };

    let res;
    try {
      res = await expoFetch(CHAT_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          deviceId,
          region,
          language,
          todayContext,
          personalization,
          personaPreferences,
        }),
        signal: controller.signal,
      });
    } catch (e) {
      cleanup();
      if (externalSignal?.aborted) throw new Error("Cancelled.");
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw new Error("Couldn't reach the chat server. Check your connection and try again.");
    }

    if (!res.ok) {
      cleanup();
      if (res.status === 429) {
        // Retrying this one immediately can only fail the same way again —
        // tell the caller not to offer a retry affordance for it, unlike
        // every other failure path here.
        const err = new Error("You've reached today's message limit — try again tomorrow.");
        err.retriable = false;
        throw err;
      }
      let detail = "";
      try {
        detail = (await res.json()).error || "";
      } catch (e) {
        // non-JSON error body — fall through with no extra detail
      }
      throw new Error(detail || "Something went wrong reaching Barnabas. Please try again.");
    }

    try {
      const fullText = await consumeChatStream(res.body, onDelta, resetStallTimeout);
      cleanup();
      return fullText;
    } catch (e) {
      cleanup();
      if (externalSignal?.aborted) throw new Error("Cancelled.");
      if (!e.hasReceivedData && attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      throw e;
    }
  }
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
