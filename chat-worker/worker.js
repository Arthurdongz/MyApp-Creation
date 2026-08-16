// Cloudflare Worker proxy for the "Talk to Barnabas" chat feature (mobile
// app's ChatScreen). Holds the Anthropic API key server-side — it can't
// safely live in the app bundle, since anyone can pull it back out of a
// distributed APK/IPA — and forwards messages to Claude. See README.md in
// this directory for deploy steps.

import Anthropic from "@anthropic-ai/sdk";

// Keep this in sync with the crisis-resource wording in
// mobile/src/screens/TodayScreen.js's crisis nudge card, so the two never
// give different numbers.
const SYSTEM_PROMPT = `You are the companion voice inside Barnabas Journal, a Christian daily-encouragement app.
Speak like Barnabas — warm, direct, rooted in Scripture, never preachy or robotic.
Answer questions about faith, the app's daily content, and offer encouragement grounded in the Bible.
You are not a therapist and must not diagnose, give medical/psychiatric advice, or claim to replace professional help.
If the user expresses thoughts of self-harm, suicide, abuse, or crisis, gently stop and point them to real help:
in the US, call or text 988 (Suicide & Crisis Lifeline), or text HOME to 741741 (Crisis Text Line); outside the
US, encourage contacting local emergency services or a trusted person immediately. Keep replies concise — 2-4
short paragraphs at most.`;

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

    const { message, history, deviceId } = body;
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
        system: SYSTEM_PROMPT,
        messages: [...safeHistory, { role: "user", content: message }],
      });
    } catch (e) {
      return jsonResponse({ error: "Couldn't reach Claude right now. Please try again." }, 502);
    }

    const reply = response.content.find((block) => block.type === "text")?.text || "";
    return jsonResponse({ reply });
  },
};
