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
const CRISIS_RESOURCES = {
  US: "If the user is in the US, the 988 Suicide & Crisis Lifeline is free and confidential, day or night — call or text 988. They can also text HOME to 741741 for the Crisis Text Line.",
  CA: "If the user is in Canada, they can call or text 988 to reach the Suicide Crisis Helpline, free and confidential, day or night. In Quebec, 1-866-APPELLE (1-866-277-3553) is also available.",
  GB: "If the user is in the UK, Samaritans are free to call anytime at 116 123, or they can text SHOUT to 85258 for the Shout Crisis Text Line.",
  IE: "If the user is in Ireland, Samaritans are free to call anytime at 116 123, or Pieta's 24-hour helpline is 1800 247 247, or they can text HELP to 51444.",
  AU: "If the user is in Australia, Lifeline is free to call anytime at 13 11 14, or they can text 0477 13 11 14.",
  ES: "Si el usuario está en España, la línea 024 de atención a la conducta suicida es gratuita y está disponible las 24 horas — pueden llamar al 024.",
  MX: "Si el usuario está en México, la Línea de la Vida está disponible las 24 horas — pueden llamar al 800 911 2000.",
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

function systemPromptFor(region, language) {
  const crisisLine = CRISIS_RESOURCES[region] || DEFAULT_CRISIS_RESOURCE;
  const languageName = LANGUAGE_NAMES[language] || "English";
  return `You are the companion voice inside Barnabas Journal, a Christian daily-encouragement app.
Speak like Barnabas — warm, direct, rooted in Scripture, never preachy or robotic.
Answer questions about faith, the app's daily content, and offer encouragement grounded in the Bible.
You are not a therapist and must not diagnose, give medical/psychiatric advice, or claim to replace professional help.
If the user expresses thoughts of self-harm, suicide, abuse, or crisis, gently stop and point them to real help.
${crisisLine}
Keep replies concise — 2-4 short paragraphs at most.
Always reply in ${languageName}, regardless of what language the user writes in — that's the app's current display language, and switching away from it would be jarring even if they type in a different one.`;
}

const MAX_REQUESTS_PER_DAY = 30;
const MAX_HISTORY_TURNS = 10;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Not found", { status: 404 });

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }

    const { message, history, deviceId, region, language } = body;
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

    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    let response;
    try {
      response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: systemPromptFor(typeof region === "string" ? region : null, typeof language === "string" ? language : null),
        messages: [...safeHistory, { role: "user", content: message }],
      });
    } catch (e) {
      return jsonResponse({ error: "Couldn't reach Claude right now. Please try again." }, 502);
    }

    const reply = response.content.find((block) => block.type === "text")?.text || "";
    return jsonResponse({ reply });
  },
};
