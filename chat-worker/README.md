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

## Cost

At the current pricing for `claude-haiku-4-5` ($1/$5 per million input/output
tokens), a typical exchange costs roughly $0.002. See the in-app discussion
this was scoped from for fuller monthly-cost projections at scale — even a
genuinely popular chat feature stays in the tens-to-low-hundreds of dollars a
month. Cloudflare Workers' free tier (100k requests/day) covers this app's
volume with room to spare.

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
