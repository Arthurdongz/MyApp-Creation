#!/usr/bin/env node
// Content-integrity checks for the 366-entry content banks (verses, Barnabas
// moments, encouragements, wisdom, stories, mobile-only notification
// highlights). Catches the three bug classes found by hand during content
// rewrites this project: wrong entry counts, exact-duplicate entries, and
// "word word" grammar collisions (e.g. "with with", "today today") produced
// by template-based generation. Also verifies every web content bank is
// byte-identical to its mobile mirror.
//
// Run: node scripts/check-content.js
// Exits non-zero on any hard failure.

const vm = require("vm");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let failures = 0;
let warnings = 0;

function fail(msg) {
  console.error("FAIL: " + msg);
  failures++;
}

function warn(msg) {
  console.warn("WARN: " + msg);
  warnings++;
}

function ok(msg) {
  console.log("OK: " + msg);
}

function load(relPath, exportName) {
  const full = path.join(ROOT, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const normalized = raw.replace(/export const/g, "const");
  const code = normalized + `\nmodule.exports = ${exportName};`;
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(code, sandbox, { filename: full });
  return sandbox.module.exports;
}

const WORD_COLLISION_RE = /\b(\w+)\s+\1\b/i;

// Doubled words that are legitimate English grammar, not generation bugs
// (e.g. past perfect "had had", or "that that" in a relative clause).
// Only relevant for hand-written prose (stories/wisdom insight) — the
// template-generated banks (moments/encouragements) have no legitimate use
// of these and should never suppress a match.
const LEGITIMATE_DOUBLES = new Set(["had", "that", "very"]);

function isLegitimateDouble(word) {
  return LEGITIMATE_DOUBLES.has(word.toLowerCase());
}

function checkStringBank(name, arr, expectedCount, { hardFailCollision = true } = {}) {
  if (expectedCount != null && arr.length !== expectedCount) {
    fail(`${name}: expected ${expectedCount} entries, found ${arr.length}`);
  } else if (expectedCount != null) {
    ok(`${name}: ${arr.length} entries`);
  }

  const seen = new Map();
  let dupCount = 0;
  arr.forEach((s, i) => {
    if (seen.has(s)) {
      fail(`${name}: exact duplicate at index ${i} (also at ${seen.get(s)}): "${s.slice(0, 70)}..."`);
      dupCount++;
    } else {
      seen.set(s, i);
    }
  });
  if (dupCount === 0) ok(`${name}: no exact duplicates`);

  let collisions = 0;
  arr.forEach((s, i) => {
    const m = s.match(WORD_COLLISION_RE);
    if (m && !isLegitimateDouble(m[1])) {
      const report = `${name}: word-collision "${m[0]}" at index ${i}: "${s}"`;
      if (hardFailCollision) fail(report);
      else warn(report);
      collisions++;
    }
  });
  if (collisions === 0) ok(`${name}: no word-collision bugs`);
}

function checkObjectFieldDuplicates(name, arr, field) {
  const seen = new Map();
  let dupCount = 0;
  arr.forEach((obj, i) => {
    const v = obj[field];
    if (v == null) return;
    if (seen.has(v)) {
      fail(`${name}: duplicate "${field}" at index ${i} (also at ${seen.get(v)}): "${String(v).slice(0, 70)}"`);
      dupCount++;
    } else {
      seen.set(v, i);
    }
  });
  if (dupCount === 0) ok(`${name}: no duplicate "${field}" values`);
}

function checkObjectFieldCollisions(name, arr, fields, { hardFail = true } = {}) {
  let collisions = 0;
  arr.forEach((obj, i) => {
    for (const field of fields) {
      const v = obj[field];
      if (typeof v !== "string") continue;
      const m = v.match(WORD_COLLISION_RE);
      if (m && !isLegitimateDouble(m[1])) {
        const report = `${name}: word-collision "${m[0]}" in field "${field}" at index ${i}: "${v}"`;
        if (hardFail) fail(report);
        else warn(report);
        collisions++;
      }
    }
  });
  if (collisions === 0) ok(`${name}: no word-collision bugs in ${fields.join(", ")}`);
}

function checkMirrorIdentical(name, webArr, mobileArr) {
  const a = JSON.stringify(webArr);
  const b = JSON.stringify(mobileArr);
  if (a === b) {
    ok(`${name}: web and mobile are byte-identical`);
  } else {
    fail(`${name}: web and mobile content banks differ`);
  }
}

console.log("=== ENCOURAGEMENTS ===");
{
  const web = load("data-encouragements.js", "ENCOURAGEMENTS");
  const mobile = load("mobile/src/data/encouragements.js", "ENCOURAGEMENTS");
  checkStringBank("ENCOURAGEMENTS (web)", web, 366);
  checkMirrorIdentical("ENCOURAGEMENTS", web, mobile);
}

console.log("\n=== BARNABAS_MOMENTS ===");
{
  const web = load("data-moments.js", "BARNABAS_MOMENTS");
  const mobile = load("mobile/src/data/moments.js", "BARNABAS_MOMENTS");
  checkStringBank("BARNABAS_MOMENTS (web)", web, 366);
  checkMirrorIdentical("BARNABAS_MOMENTS", web, mobile);
}

console.log("\n=== HIGHLIGHTS (mobile-only) ===");
{
  const mobile = load("mobile/src/data/highlights.js", "HIGHLIGHTS");
  checkStringBank("HIGHLIGHTS (mobile)", mobile, 366);
}

console.log("\n=== VERSES ===");
{
  const web = load("data-verses.js", "VERSES");
  const mobile = load("mobile/src/data/verses.js", "VERSES");
  const webVersions = load("data-verses.js", "BIBLE_VERSIONS");

  if (web.length !== 366) fail(`VERSES (web): expected 366 entries, found ${web.length}`);
  else ok(`VERSES (web): ${web.length} entries`);

  checkObjectFieldDuplicates("VERSES", web, "ref");

  const versionIds = webVersions.map((v) => v.id);
  let missing = 0;
  web.forEach((entry, i) => {
    for (const id of versionIds) {
      const text = entry.versions && entry.versions[id];
      if (!text || !text.trim()) {
        fail(`VERSES: missing/empty "${id}" text at index ${i} (${entry.ref})`);
        missing++;
      }
    }
  });
  if (missing === 0) ok(`VERSES: all entries have text for all ${versionIds.length} versions`);

  let collisions = 0;
  web.forEach((entry, i) => {
    for (const id of versionIds) {
      const text = entry.versions && entry.versions[id];
      if (typeof text !== "string") continue;
      const m = text.match(WORD_COLLISION_RE);
      if (m) {
        warn(`VERSES: word-collision "${m[0]}" in ${id} at index ${i} (${entry.ref}) — verify against source text, scripture can legitimately repeat words: "${text}"`);
        collisions++;
      }
    }
  });
  if (collisions === 0) ok("VERSES: no word-collision flags across all versions");

  checkMirrorIdentical("VERSES", web, mobile);
}

console.log("\n=== WISDOM ===");
{
  const web = load("data-wisdom.js", "WISDOM");
  const mobile = load("mobile/src/data/wisdom.js", "WISDOM");
  if (web.length !== 366) fail(`WISDOM (web): expected 366 entries, found ${web.length}`);
  else ok(`WISDOM (web): ${web.length} entries`);
  checkObjectFieldDuplicates("WISDOM", web, "text");
  checkObjectFieldCollisions("WISDOM", web, ["text"]);
  checkMirrorIdentical("WISDOM", web, mobile);
}

console.log("\n=== STORIES ===");
{
  const web = load("data-stories.js", "STORIES");
  const mobile = load("mobile/src/data/stories.js", "STORIES");
  ok(`STORIES (web): ${web.length} entries (no fixed count — cycles via pickForDaySmallBank)`);
  checkObjectFieldDuplicates("STORIES", web, "title");
  checkObjectFieldDuplicates("STORIES", web, "text");
  checkObjectFieldCollisions("STORIES", web, ["text", "insight"]);
  checkMirrorIdentical("STORIES", web, mobile);
}

console.log(`\n=== Summary: ${failures} failure(s), ${warnings} warning(s) ===`);
if (failures > 0) {
  process.exit(1);
}
