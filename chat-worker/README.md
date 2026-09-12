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
2. **The Barnabas reply** — a normal Claude Haiku 4.5 call with the
   `lookup_bible_verse` tool available. The system prompt requires Claude to
   call it before quoting or closely paraphrasing any specific verse, so
   replies are grounded in this project's own verified KJV text
   (`mobile/src/data/bible-kjv.json`, fetched once per Worker isolate and
   cached in memory) instead of the model's own recall. The tool-call
   exchange stays entirely server-side — the client only ever sees the final
   text, never tool_use/tool_result blocks.

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

At the current pricing for `claude-haiku-4-5` ($1/$5 per million input/output
tokens), a typical exchange (safety check + main reply, occasionally with a
verse lookup) costs roughly $0.004-0.006 — a bit more than the original
single-call design, since every message now makes at least two model calls.
See the in-app discussion this was scoped from for fuller monthly-cost
projections at scale — even a genuinely popular chat feature stays in the
tens-to-low-hundreds of dollars a month. Cloudflare Workers' free tier (100k
requests/day) covers this app's volume with room to spare.

## What's NOT done yet

This Worker and the app's ChatScreen give every user 20 free messages a
month, forever (tracked locally on-device — see `computeChatAccess` in
`mobile/src/storage.js`, which rolls the count over each calendar month).
Once that month's messages are used up, the app shows a paywall with a
"Subscribe for Unlimited Chat" button that's currently a stub (just shows
an alert) — there's no App Store/Play Console subscription product or
RevenueCat project wired up yet. That's a separate setup step in your own
developer accounts before real payments can flow.

Note: since this quota lives in local device storage rather than an
account, uninstalling and reinstalling the app resets it — there's no way
to close that loophole without real accounts or store-receipt-based
eligibility checks, which is a bigger lift than the quota itself.
