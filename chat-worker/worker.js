// Cloudflare Worker proxy for the "Talk to Barnabas" chat feature (mobile
// app's ChatScreen). Holds the Anthropic API key server-side — it can't
// safely live in the app bundle, since anyone can pull it back out of a
// distributed APK/IPA — and forwards messages to Claude. See README.md in
// this directory for deploy steps.

import Anthropic from "@anthropic-ai/sdk";

// Keep this table in sync with mobile/src/crisisResources.js — duplicated
// here because this Worker is a separate deployable project with no
// import access to the mobile app's source. Numbers verified against each
// organization's own site as of 2026-08; if any of these ever go stale,
// check the source before editing — this is safety-critical text.
// The region is already known (from the device locale the client sent) by
// the time these get used, so state the resource directly rather than
// hedging with "if the user is in X" — that phrasing was appropriate for
// the old single-message-for-everyone fallback, not a matched region.
const CRISIS_RESOURCES = {
  US: "The 988 Suicide & Crisis Lifeline is free and confidential, day or night — call or text 988. They can also text HOME to 741741 for the Crisis Text Line.",
  CA: "They can call or text 988 to reach the Suicide Crisis Helpline, free and confidential, day or night. In Quebec, 1-866-APPELLE (1-866-277-3553) is also available.",
  GB: "Samaritans are free to call anytime at 116 123, or they can text SHOUT to 85258 for the Shout Crisis Text Line.",
  IE: "Samaritans are free to call anytime at 116 123, or Pieta's 24-hour helpline is 1800 247 247, or they can text HELP to 51444.",
  AU: "Lifeline is free to call anytime at 13 11 14, or they can text 0477 13 11 14.",
  ES: "La línea 024 de atención a la conducta suicida es gratuita y está disponible las 24 horas — pueden llamar al 024.",
  MX: "La Línea de la Vida está disponible las 24 horas — pueden llamar al 800 911 2000.",
  ZW: "Friendship Bench's National Mental Health and Suicide Prevention Helpline is free at 0808 4116, Monday–Friday 8am–5pm — WhatsApp and SMS are also available.",
  ZA: "SADAG's Suicide Crisis Helpline is toll-free and available 24/7 at 0800 567 567.",
  KE: "Befrienders Kenya offers free, confidential support by phone, SMS, or WhatsApp at 0722 178 177, Monday–Friday 9am–5pm.",
};

const DEFAULT_CRISIS_RESOURCE =
  'Encourage the user to search "crisis line" together with their country\'s name to find a local number, or to contact local emergency services or a trusted person immediately.';

// Keep in sync with mobile/src/i18n/index.js's SUPPORTED_LANGUAGES.
const LANGUAGE_NAMES = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
};

// The deterministic crisis short-circuit reply (see needsCrisisResponse
// below) is developer-written, not model-generated, in each supported
// language — the {crisisLine} slot is filled in with the region-specific
// resource above, which may itself be in a different language than the
// wrapper sentence (the resource text is keyed by region, this wrapper by
// the app's display language — those aren't always the same person's
// situation, but the actual phone number/text line stays accurate either
// way, which is what matters most here).
const CRISIS_REPLY_TEMPLATES = {
  en: (crisisLine) =>
    `I'm really glad you told me. ${crisisLine} Please reach out to them, or to someone you trust, right now — you don't have to carry this alone.`,
  es: (crisisLine) =>
    `Me alegra mucho que me lo hayas contado. ${crisisLine} Por favor, comunícate con ellos, o con alguien de confianza, ahora mismo — no tienes que cargar con esto tú solo.`,
  pt: (crisisLine) =>
    `Fico muito feliz que você tenha me contado isso. ${crisisLine} Por favor, entre em contato com eles, ou com alguém de confiança, agora mesmo — você não precisa carregar isso sozinho.`,
  fr: (crisisLine) =>
    `Je suis vraiment content que tu m'en aies parlé. ${crisisLine} Contacte-les, ou quelqu'un en qui tu as confiance, dès maintenant — tu n'as pas à porter ça seul.`,
};

// Caps on the untrusted-ish string fields below — this data comes from the
// client, and while it's meant to mirror the app's own bounded content
// (today's story/moment, a handful of mood words), a tampered client could
// send something much larger. These go straight into the system prompt, so
// keep them generous enough for real content but bounded regardless.
const CONTEXT_FIELD_MAX_LEN = 3000;
const MOOD_WORD_MAX_LEN = 40;
const MAX_RECENT_MOODS = 7;

function truncate(value, maxLen) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

// Validates and narrows the client-sent todayContext to just the fields
// this prompt actually uses, dropping anything unexpected rather than
// forwarding an arbitrary object into the system prompt verbatim.
function sanitizeTodayContext(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  const verseRef = truncate(raw.verseRef, 60);
  const storyTitle = truncate(raw.storyTitle, 200);
  const storyText = truncate(raw.storyText, CONTEXT_FIELD_MAX_LEN);
  const momentText = truncate(raw.momentText, CONTEXT_FIELD_MAX_LEN);
  if (verseRef) out.verseRef = verseRef;
  if (storyTitle && storyText) {
    out.storyTitle = storyTitle;
    out.storyText = storyText;
  }
  if (momentText) out.momentText = momentText;
  return Object.keys(out).length ? out : null;
}

// Same idea for the personalization summary — plain numbers/booleans and a
// short list of single-word mood labels, nothing free-form like the user's
// actual reflection text (that stays private to the app; see
// mobile/src/screens/ChatScreen.js for why only these lightweight signals
// are sent at all).
function sanitizePersonalization(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  if (Number.isFinite(raw.streak) && raw.streak >= 0) out.streak = Math.floor(raw.streak);
  if (Number.isFinite(raw.momentsDone) && raw.momentsDone >= 0) out.momentsDone = Math.floor(raw.momentsDone);
  if (typeof raw.todaysMomentDone === "boolean") out.todaysMomentDone = raw.todaysMomentDone;
  if (Array.isArray(raw.recentMoods)) {
    const moods = raw.recentMoods
      .map((m) => truncate(m, MOOD_WORD_MAX_LEN))
      .filter(Boolean)
      .slice(0, MAX_RECENT_MOODS);
    if (moods.length) out.recentMoods = moods;
  }
  return Object.keys(out).length ? out : null;
}

function systemPromptFor(region, language, todayContext, personalization) {
  const crisisLine = CRISIS_RESOURCES[region] || DEFAULT_CRISIS_RESOURCE;
  const languageName = LANGUAGE_NAMES[language] || "English";
  let prompt = `You are the companion voice inside Barnabas Journal, a Christian daily-encouragement app.
Speak like Barnabas — warm, direct, rooted in Scripture, never preachy or robotic.
Answer questions about faith, the app's daily content, and offer encouragement grounded in the Bible.
You are not a therapist and must not diagnose, give medical/psychiatric advice, or claim to replace professional help.
If the user expresses thoughts of self-harm, suicide, abuse, or crisis, gently stop and point them to real help.
${crisisLine}
When you quote or closely paraphrase a specific Bible verse, always call lookup_bible_verse first and use its exact wording — even for verses you're confident you already know correctly. Never present a scripture quotation you have not looked up.
Keep replies concise — 2-4 short paragraphs at most.
Always reply in ${languageName}, regardless of what language the user writes in — that's the app's current display language, and switching away from it would be jarring even if they type in a different one.`;

  if (todayContext) {
    prompt += `\n\nToday's content in the app, in case the user asks about it — reference it accurately rather than guessing from memory, but only bring it up if it's actually relevant to what they're saying:`;
    if (todayContext.verseRef) {
      prompt += `\n- Today's verse is ${todayContext.verseRef} (still call lookup_bible_verse for its exact wording before quoting it).`;
    }
    if (todayContext.storyTitle) {
      prompt += `\n- Today's true story, "${todayContext.storyTitle}": ${todayContext.storyText}`;
    }
    if (todayContext.momentText) {
      prompt += `\n- Today's suggested Barnabas moment (a small act of kindness): ${todayContext.momentText}`;
    }
  }

  if (personalization) {
    prompt += `\n\nLightweight context about this specific user, from their own app activity — weave it in naturally if it's relevant, never recite it back as a list of stats:`;
    if (typeof personalization.streak === "number") prompt += `\n- Current streak: ${personalization.streak} day(s).`;
    if (typeof personalization.momentsDone === "number") {
      prompt += `\n- Barnabas moments (small acts of kindness) completed so far: ${personalization.momentsDone}.`;
    }
    if (personalization.recentMoods?.length) {
      prompt += `\n- Their mood the last few days, oldest to most recent: ${personalization.recentMoods.join(", ")}.`;
    }
    if (personalization.todaysMomentDone) prompt += `\n- They've already completed today's Barnabas moment.`;
  }

  return prompt;
}

const MAX_REQUESTS_PER_DAY = 30;
const MAX_HISTORY_TURNS = 10;
const MAX_TOOL_ROUNDS = 3;

// Book names in canonical order, matching the app's own bundled Bible data
// (data-bible-books.js) — duplicated here for the same reason as
// CRISIS_RESOURCES above: this Worker can't import from the mobile app.
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
  "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

// The always-bundled KJV text this project already ships and has verified
// (see the Bible-version-reader work in the app itself) — fetched once per
// Worker isolate and cached in module scope, not re-fetched per request.
// Pinned to this branch; update if it's ever renamed or merged to a
// default branch.
const KJV_DATA_URL =
  "https://raw.githubusercontent.com/Arthurdongz/MyApp-Creation/claude/barnabas-journal-app-xxz25d/mobile/src/data/bible-kjv.json";

let kjvTextPromise = null;
function getKjvText() {
  if (!kjvTextPromise) {
    kjvTextPromise = fetch(KJV_DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch KJV data: ${r.status}`);
        return r.json();
      })
      .catch((e) => {
        kjvTextPromise = null; // let a later request retry instead of caching the failure forever
        throw e;
      });
  }
  return kjvTextPromise;
}

// Parses a single reference like "John 3:16" or "1 John 4:8-10" (verse
// ranges within one chapter only — Claude is asked for one reference at a
// time, so multi-piece refs like "Psalm 13:1,5" aren't needed here).
function parseScriptureRef(reference) {
  if (typeof reference !== "string") return null;
  const match = reference
    .trim()
    .match(/^((?:[123]\s)?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(\d+))?/);
  if (!match) return null;
  const book = BIBLE_BOOKS.find((b) => b.toLowerCase() === match[1].trim().toLowerCase());
  if (!book) return null;
  const chapter = parseInt(match[2], 10);
  const verseStart = parseInt(match[3], 10);
  const verseEnd = match[4] ? parseInt(match[4], 10) : verseStart;
  if (verseEnd < verseStart) return null;
  return { book, chapter, verseStart, verseEnd };
}

async function lookupBibleVerse(reference) {
  const parsed = parseScriptureRef(reference);
  if (!parsed) return { error: `Could not parse "${reference}" as a scripture reference.` };

  let kjv;
  try {
    kjv = await getKjvText();
  } catch (e) {
    return { error: "Could not reach the Bible text source right now — do not quote this passage; describe it in your own words instead, or tell the user you can't verify the exact wording right now." };
  }

  const bookIndex = BIBLE_BOOKS.indexOf(parsed.book);
  const chapterVerses = kjv[bookIndex]?.[parsed.chapter - 1];
  if (!chapterVerses) return { error: `${parsed.book} ${parsed.chapter} was not found.` };

  const verses = [];
  for (let v = parsed.verseStart; v <= parsed.verseEnd; v++) {
    const text = chapterVerses[v - 1];
    if (!text) return { error: `${parsed.book} ${parsed.chapter}:${v} was not found.` };
    verses.push(`${v} ${text}`);
  }
  return { book: parsed.book, chapter: parsed.chapter, translation: "KJV", text: verses.join(" ") };
}

const BIBLE_LOOKUP_TOOL = {
  name: "lookup_bible_verse",
  description:
    'Look up the exact King James Version (KJV) text of a Bible passage by reference, e.g. "John 3:16" or "Romans 8:28-30". Always call this before quoting or closely paraphrasing specific scripture in your reply, even for very familiar verses — do not rely on memory for exact wording.',
  input_schema: {
    type: "object",
    properties: {
      reference: {
        type: "string",
        description: 'A single scripture reference within one chapter, e.g. "Psalm 23:1" or "1 John 4:8".',
      },
    },
    required: ["reference"],
  },
};

// A second, narrowly-scoped model call whose only job is deciding whether
// this message needs the deterministic crisis reply below instead of a
// normal Barnabas-voice reply — kept separate from the main persona call
// so crisis detection doesn't depend on one general-purpose reply also
// remembering to redirect correctly every time. Runs before the main
// call, not in parallel, so a flagged message skips that cost entirely.
const SAFETY_TOOL = {
  name: "report_safety_assessment",
  description: "Report whether this message needs an immediate crisis-resource response instead of a normal conversational reply.",
  input_schema: {
    type: "object",
    properties: {
      needs_crisis_response: {
        type: "boolean",
        description:
          "True only if the message expresses active or serious thoughts of self-harm, suicide, or ongoing abuse — not general sadness, stress, frustration, or a hypothetical/past-tense/third-party mention.",
      },
    },
    required: ["needs_crisis_response"],
  },
};

async function needsCrisisResponse(anthropic, message) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system:
        "You are a safety classifier for one incoming chat message in a Christian encouragement app. Assess only whether it needs an immediate crisis-resource redirect — do not write a reply.",
      tools: [SAFETY_TOOL],
      tool_choice: { type: "tool", name: "report_safety_assessment" },
      messages: [{ role: "user", content: message }],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    return Boolean(block?.input?.needs_crisis_response);
  } catch (e) {
    // If the classifier call itself fails, fall through to the normal
    // reply rather than blocking the whole conversation on it — the main
    // system prompt still carries its own crisis-redirect instruction as
    // a fallback.
    return false;
  }
}

// Generates the actual Barnabas reply, letting Claude call
// lookup_bible_verse as many times as it needs (bounded) before settling
// on final text. The intermediate tool-call/tool-result exchange never
// leaves this function — only the final text goes back to the client, so
// the app's own conversation history stays plain user/assistant text.
async function generateReply(anthropic, system, initialMessages) {
  let messages = initialMessages;
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      system,
      tools: [BIBLE_LOOKUP_TOOL],
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      return response.content.find((b) => b.type === "text")?.text || "";
    }

    messages = [...messages, { role: "assistant", content: response.content }];
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const result =
        block.name === "lookup_bible_verse"
          ? await lookupBibleVerse(block.input?.reference)
          : { error: "Unknown tool." };
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }
    messages = [...messages, { role: "user", content: toolResults }];
  }

  // Ran out of tool-call rounds — ask once more without tools so it has to
  // answer in plain text rather than looping forever.
  const finalResponse = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    system,
    messages,
  });
  return finalResponse.content.find((b) => b.type === "text")?.text || "";
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const FEEDBACK_MESSAGE_MAX_LEN = 4000;

// Stores one thumbs-up/down reaction to a reply, keyed so it never
// overwrites another and ages out on its own — this is a developer review
// signal (see mobile/src/screens/ChatScreen.js and this repo's chat-worker
// README for how to list/read these via wrangler), not a live feature the
// app reads back, so there's no read path here at all, only a write one.
// Reuses RATE_LIMIT_KV rather than provisioning a second KV namespace —
// the key prefix keeps the two purposes from colliding.
async function handleFeedback(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const { deviceId, feedback, userMessage, assistantMessage } = body;
  if (!deviceId || typeof deviceId !== "string") {
    return jsonResponse({ error: "Missing device id." }, 400);
  }
  if (feedback !== "up" && feedback !== "down") {
    return jsonResponse({ error: "Invalid feedback value." }, 400);
  }
  const safeUserMessage = truncate(userMessage, FEEDBACK_MESSAGE_MAX_LEN) || "";
  const safeAssistantMessage = truncate(assistantMessage, FEEDBACK_MESSAGE_MAX_LEN) || "";

  const key = `feedback:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  const record = {
    deviceId,
    feedback,
    userMessage: safeUserMessage,
    assistantMessage: safeAssistantMessage,
    ts: new Date().toISOString(),
  };
  // 90 days — long enough for periodic review, short enough not to
  // accumulate this indefinitely.
  await env.RATE_LIMIT_KV.put(key, JSON.stringify(record), { expirationTtl: 90 * 86400 });

  return jsonResponse({ ok: true });
}

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const { message, history, deviceId, region, language, todayContext, personalization } = body;
  if (!message || typeof message !== "string" || message.length > 2000) {
    return jsonResponse({ error: "Invalid message." }, 400);
  }
  if (!deviceId || typeof deviceId !== "string") {
    return jsonResponse({ error: "Missing device id." }, 400);
  }

  const dayKey = `${deviceId}:${new Date().toISOString().slice(0, 10)}`;
  const count = parseInt((await env.RATE_LIMIT_KV.get(dayKey)) || "0", 10);
  if (count >= MAX_REQUESTS_PER_DAY) {
    return jsonResponse({ error: "You've reached today's message limit — try again tomorrow." }, 429);
  }
  await env.RATE_LIMIT_KV.put(dayKey, String(count + 1), { expirationTtl: 86400 });

  const safeHistory = Array.isArray(history)
    ? history
        .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
        .slice(-MAX_HISTORY_TURNS)
    : [];
  const resolvedRegion = typeof region === "string" ? region : null;
  const resolvedLanguage = typeof language === "string" ? language : null;
  const safeTodayContext = sanitizeTodayContext(todayContext);
  const safePersonalization = sanitizePersonalization(personalization);

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    if (await needsCrisisResponse(anthropic, message)) {
      const crisisLine = CRISIS_RESOURCES[resolvedRegion] || DEFAULT_CRISIS_RESOURCE;
      const template = CRISIS_REPLY_TEMPLATES[resolvedLanguage] || CRISIS_REPLY_TEMPLATES.en;
      return jsonResponse({ reply: template(crisisLine) });
    }

    const reply = await generateReply(
      anthropic,
      systemPromptFor(resolvedRegion, resolvedLanguage, safeTodayContext, safePersonalization),
      [...safeHistory, { role: "user", content: message }]
    );
    return jsonResponse({ reply });
  } catch (e) {
    return jsonResponse({ error: "Couldn't reach Claude right now. Please try again." }, 502);
  }
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Not found", { status: 404 });

    const { pathname } = new URL(request.url);
    if (pathname === "/feedback") return handleFeedback(request, env);
    if (pathname === "/" || pathname === "") return handleChat(request, env);
    return new Response("Not found", { status: 404 });
  },
};
