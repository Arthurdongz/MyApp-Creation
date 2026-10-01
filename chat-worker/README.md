# Barnabas Chat Worker

Cloudflare Worker that proxies the mobile app's "Talk to Barnabas" chat
feature to Claude. It exists because the Anthropic API key can't safely
ship inside the app itself — anyone can pull it back out of a distributed
APK/IPA — so this small server holds the key instead and the app talks to
it, not to Claude directly.

This has to be deployed with **your own** Cloudflare and Anthropic
accounts — nobody else can do this step for you.

## One-time setup

```bash
cd chat-worker
npm install
npx wrangler login          # opens a browser to authorize your Cloudflare account
```

## Create the rate-limit store

The Worker caps each device to 30 messages/day so a single bad actor can't
run up your Anthropic bill. That counter lives in a Workers KV namespace:

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

This prints an `id`. Copy it into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

## Add your Anthropic API key

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste your key (from console.anthropic.com) when prompted. It's stored
encrypted by Cloudflare, never in this repo.

## Deploy

```bash
npx wrangler deploy
```

This prints a URL like `https://barnabas-chat.<your-subdomain>.workers.dev`.

## Wire it into the app

Copy that URL into `mobile/src/chat.js`'s `CHAT_WORKER_URL` constant,
replacing the `https://REPLACE-ME.workers.dev` placeholder. Rebuild/republish
the app (or push an EAS OTA update, since this is a JS-only change) for the
chat feature to start working.

## Language

The app now ships in English, Spanish, Portuguese, and French. The client
sends its current UI language (`i18n.language`) with every message, and
`systemPromptFor()` in `worker.js` instructs Claude to always reply in
that language — regardless of what language the user actually types in —
so the conversation never drifts away from the app's display language.
Add new entries to `LANGUAGE_NAMES` in `worker.js` (kept in sync with
`mobile/src/i18n/index.js`'s `SUPPORTED_LANGUAGES`) when a new language is
added to the app.

## How a reply gets generated

Every incoming message goes through two Claude calls before the client sees
anything:

1. **Safety classification** — a small, forced-tool-choice call that only
   decides whether this message needs an immediate crisis-resource redirect.
   If so, the Worker returns a **developer-written, non-AI-generated**
   message (see `CRISIS_REPLY_TEMPLATES`) with the region's real crisis line
   plugged in, and skips the main call entirely — safety-critical replies
   don't depend on a general-purpose persona remembering to redirect
   correctly every time.
2. **The Barnabas reply** — a Claude Sonnet call (`CHAT_MODEL` in
   `worker.js`) with the `lookup_bible_verse` tool available. Sonnet, not
   Haiku, because the main reply is where accuracy and depth actually
   matter — the safety classifier and the two summarizers below stay on
   Haiku (`CLASSIFIER_MODEL`), since those are narrow, structured-output
   tasks where Haiku's speed costs nothing in quality. The system prompt
   requires Claude to call `lookup_bible_verse` before quoting or closely
   paraphrasing any specific verse, so replies are grounded in this
   project's own verified KJV text (`mobile/src/data/bible-kjv.json`,
   fetched once per Worker isolate and cached in memory) instead of the
   model's own recall. The tool-call exchange stays entirely server-side —
   the client never sees tool_use/tool_result blocks — but text *is*
   streamed to the client live as the model generates it (NDJSON over the
   HTTP response body, one `{"type":"delta","text":"..."}` line per chunk),
   including any brief text a round produces before it decides to call the
   tool.

If the KJV fetch ever fails (e.g. GitHub is unreachable), `lookup_bible_verse`
returns an error the model is instructed to handle by describing the passage
in its own words or admitting it can't verify the exact wording, rather than
quoting anyway.

## Grounding in today's app content, and light personalization

Every chat request can optionally carry two extra fields, both built
client-side (see `mobile/src/screens/ChatScreen.js`) and sanitized
server-side (`sanitizeTodayContext`/`sanitizePersonalization` in
`worker.js`) before ever reaching the system prompt:

- **`todayContext`** — today's actual verse reference, true story, and
  suggested Barnabas moment, exactly as the user is seeing them in the app.
  Lets Barnabas answer "what's today's story?" accurately instead of
  guessing from training data — the same anti-hallucination idea as the
  verse lookup, extended to the app's own content banks.
- **`personalization`** — lightweight, non-text signals only: streak,
  moments-done count, whether today's moment is done, and a short list of
  recent mood words. Never the user's actual reflection/journal text, which
  stays on-device unless they type it into the chat themselves. Toggleable
  per-user from within ChatScreen (`settings.chatPersonalizationEnabled`,
  default on).

## Long conversations: per-conversation summary

`MAX_HISTORY_TURNS` used to be a hard cutoff — once a conversation passed
10 messages, everything older was silently dropped from what Claude saw.
It's now `SUMMARY_WINDOW` (16): the most recent messages up to that count
still go to Claude verbatim, but once older messages age out of that
window, `summarizeOlderTurns` folds them into a short running recap
(a cheap Haiku call) instead of discarding them. The client
(`mobile/src/chat.js`/`storage.js`) stores that recap plus how many
messages it already covers (`summary`/`summarizedThroughIndex` on the
conversation object) and sends both back with the next message, so the
Worker only needs to summarize the newly-aged-out chunk each time, not
start over. The Worker reports an updated recap back to the client via a
`{"type":"summary","text":"...","throughIndex":N}` NDJSON line, emitted
only on the turns where the window actually advanced.

## Cross-conversation memory (opt-in)

Separately from the per-conversation summary above, `POST /memory` lets
the client ask Barnabas to remember a handful of consolidated facts about
a person *across* separate conversations — their name if shared, an
ongoing situation, a recurring prayer topic (see `updateMemory`'s system
prompt in `worker.js` for exactly what counts as worth keeping and what
doesn't). Body: `{ deviceId, previousMemory, transcript }`; response:
`{ memory }`. Called from `mobile/src/chat.js`'s `updateChatMemory`, fired
by the app when a conversation is left behind (New Chat, or closing the
chat screen) with at least a few messages in it and `settings.
chatMemoryEnabled` turned on (default **off** — unlike `personalization`
above, this summarizes the user's own typed conversation text, so it's
opt-in rather than opt-out). The resulting note is stored client-side
(`settings.chatMemoryText`) and sent with every chat request as `memory`,
folded into the system prompt the same careful way as a persona note:
background the user generated by talking to Barnabas before, never an
instruction. Rate-limited separately from the chat endpoint
(`MAX_MEMORY_UPDATES_PER_DAY`, keyed `mem:<deviceId>:<date>` in the same
KV namespace) since it fires automatically, not from a user tapping send.

## Reply feedback (thumbs up/down)

`POST /feedback` (same host, different path) records a thumbs up/down on
one reply — `{ deviceId, feedback: "up"|"down", userMessage, assistantMessage }`.
It's a write-only endpoint: there's no in-app read path, no aggregation,
and no effect on future replies (nothing "learns" from it automatically —
see the chat-improvement discussion this was scoped from for why). It's
purely a signal for you, the developer, to review periodically and use to
manually refine the system prompt or tools over time.

Records are stored in the same `RATE_LIMIT_KV` namespace under a
`feedback:<timestamp>:<random>` key, with a 90-day TTL so they don't
accumulate forever unreviewed. To look at what's been logged:

```bash
npx wrangler kv key list --binding=RATE_LIMIT_KV --prefix="feedback:"
npx wrangler kv key get --binding=RATE_LIMIT_KV "feedback:<the-key-from-above>"
```

## Cost

The main reply runs on Sonnet now, not Haiku, which is the single biggest
cost driver here — Sonnet's per-token price is well above Haiku's. Every
message still makes at least two model calls (the Haiku safety check plus
the Sonnet reply), often a third once a conversation is long enough for
`summarizeOlderTurns` to fire (also Haiku, so cheap). The per-device
(30/day) and per-IP (150/day) caps in `worker.js` bound the worst case
regardless of per-message cost; the `/memory` endpoint has its own much
lower cap (`MAX_MEMORY_UPDATES_PER_DAY`, 20/day) since it fires
automatically rather than per message. See the in-app discussion this was
scoped from for fuller monthly-cost projections at scale. Cloudflare
Workers' free tier (100k requests/day) covers this app's volume with room
to spare.

## Free tier, no subscription

There's no monthly quota, paywall, or subscription product — Talk to
Barnabas is free for everyone, bounded only by this Worker's own
anti-abuse rate limits (`MAX_REQUESTS_PER_DAY`/`MAX_REQUESTS_PER_IP_PER_DAY`
above). An earlier version of the app tracked a monthly message count
client-side and showed a "Subscribe for Unlimited Chat" paywall once it
ran out; that whole mechanism (and the unused `chatSubscribed` escape
hatch it would have needed) was removed rather than left half-wired, since
there was no real purchase flow behind it. If paid tiers ever make sense
later, that's a fresh feature to design against real usage data, not this
stub revived.
