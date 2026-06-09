/**
 * scripts/verify-content-json.mjs
 *
 * One-off parity verification for the content_json shadow step (Maasik Phase 1,
 * Step 2). Runs the REAL transcription prompt against the local known-good
 * sample report and checks that the produced JSON faithfully mirrors the HTML.
 *
 * Why this exists: the transcription call cannot be run from the Cowork sandbox
 * (outbound Anthropic + Supabase are blocked there). Run it locally where your
 * ANTHROPIC_API_KEY works:
 *
 *     node scripts/verify-content-json.mjs
 *
 * It needs nothing from Supabase. It reads MAASIK_Jyeshtha_v4_sample.html from
 * the repo root, calls Claude once, and writes the result + a PASS/FAIL report.
 * Safe to delete after you're satisfied with parity.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

// ---- load .env.local (tolerant of quoted values and spaces) -----------------
function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}
loadEnvLocal();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not found in env / .env.local');
  process.exit(1);
}

// ---- load the REAL prompt module by stripping TS types at runtime -----------
async function loadPromptModule() {
  const src = fs.readFileSync(
    path.join(ROOT, 'src/lib/maasik/content-json-prompt.ts'),
    'utf8',
  );
  const js = src
    .replace(/generatedHtml: string/, 'generatedHtml')
    .replace(/reportUserMessage: string/, 'reportUserMessage')
    .replace(/\): string \{/, ') {');
  return import('data:text/javascript,' + encodeURIComponent(js));
}

// ---- parity helpers ---------------------------------------------------------
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const htmlText = (html) => norm(html.replace(/<[^>]+>/g, ' '));

function inHtml(haystackText, value) {
  const v = norm(value);
  if (!v) return true; // empty fields are allowed by the schema
  return haystackText.includes(v);
}

const REQUIRED_TOP_LEVEL_KEYS = [
  'schema_version', 'meta', 'vedic_context', 'cover', 'archetype',
  'whats_happening', 'taste_map', 'day_plan', 'five_anchors', 'grocery',
  'commitment', 'visuals', 'time_views',
];

async function main() {
  const { CONTENT_JSON_SYSTEM_PROMPT, CONTENT_JSON_SCHEMA_VERSION, buildContentJsonUserMessage } =
    await loadPromptModule();

  const samplePath = path.join(ROOT, 'MAASIK_Jyeshtha_v4_sample.html');
  const html = fs.readFileSync(samplePath, 'utf8');
  console.log(`Loaded sample: ${samplePath} (${html.length} chars)`);

  // The sample carries its own profile context inside the report; time_views is
  // instructed to draw only from the report, so a light context note suffices.
  const reportUserMessage =
    'Profile context is embedded in the published report below. Derive time_views from the report content itself.';

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log('Calling Claude (claude-sonnet-4-6) for transcription...');
  const t0 = Date.now();
  const response = await anthropic.messages
    .stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 32000,
      temperature: 0.2,
      system: [{ type: 'text', text: CONTENT_JSON_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: buildContentJsonUserMessage(html, reportUserMessage) }],
    })
    .finalMessage();
  const ms = Date.now() - t0;

  const raw = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  const jsonStr = start >= 0 && end > start ? raw.slice(start, end + 1) : '';

  const outDir = ROOT;
  const outFile = path.join(outDir, 'content_json.sample-output.json');

  let cj;
  try {
    cj = JSON.parse(jsonStr);
  } catch (e) {
    fs.writeFileSync(outFile.replace('.json', '.raw.txt'), raw);
    console.error(`JSON.parse failed: ${e.message}`);
    console.error(`stop_reason=${response.stop_reason} output_tokens=${response.usage.output_tokens}`);
    console.error(`Raw response written to ${outFile.replace('.json', '.raw.txt')}`);
    process.exit(1);
  }
  fs.writeFileSync(outFile, JSON.stringify(cj, null, 2));

  // ---- checks ---------------------------------------------------------------
  const text = htmlText(html);
  const checks = [];
  const ok = (name, pass, detail = '') => checks.push({ name, pass, detail });

  ok('stop_reason != max_tokens', response.stop_reason !== 'max_tokens', `stop_reason=${response.stop_reason}`);
  ok('schema_version correct', cj.schema_version === CONTENT_JSON_SCHEMA_VERSION, `got "${cj.schema_version}"`);

  const missing = REQUIRED_TOP_LEVEL_KEYS.filter((k) => !(k in cj));
  ok('all 13 top-level keys present', missing.length === 0, missing.length ? `missing: ${missing.join(',')}` : '');

  // prose parity (verbatim substrings must appear in the HTML)
  const proseProbes = [
    ['archetype.name', cj.archetype?.name],
    ['archetype.tagline', cj.archetype?.tagline],
    ['cover.verse.sanskrit', cj.cover?.verse?.sanskrit],
    ['cover.verse.english', cj.cover?.verse?.english],
    ['commitment.verse.english', cj.commitment?.verse?.english],
    ['whats_happening.fronts[0].title', cj.whats_happening?.fronts?.[0]?.title],
    ['grocery.cards[0].items[0].name', cj.grocery?.cards?.[0]?.items?.[0]?.name],
  ];
  for (const [label, val] of proseProbes) {
    ok(`prose verbatim: ${label}`, inHtml(text, val), val ? `"${norm(val).slice(0, 48)}..."` : '(empty)');
  }

  // visual parity (literal capture)
  const cg = cj.visuals?.cover_gradient || {};
  ok('cover gradient primary captured', /rgba?\(/.test(cg.primary_rgba || ''), cg.primary_rgba || '(empty)');
  ok('cover gradient primary in HTML', !cg.primary_rgba || html.includes(norm(cg.primary_rgba)), '');
  ok('cover gradient accent captured', /rgba?\(/.test(cg.accent_rgba || ''), cg.accent_rgba || '(empty)');
  ok('heat_flow_left svg captured', /<svg[\s>]/i.test(cj.visuals?.heat_flow_left?.icon_svg || ''), '');
  ok('heat_flow_right svg captured', /<svg[\s>]/i.test(cj.visuals?.heat_flow_right?.icon_svg || ''), '');
  ok('day_chart svg captured', (cj.visuals?.day_chart?.svg || '').length > 20, `${(cj.visuals?.day_chart?.svg || '').length} chars`);

  // structure counts
  const anchors = cj.day_plan?.anchors?.length || 0;
  ok('day_plan anchors present (>=5)', anchors >= 5, `${anchors} anchors`);
  const cards = cj.grocery?.cards?.length || 0;
  ok('grocery cards present (>=4)', cards >= 4, `${cards} cards`);
  ok('taste favor = 3', (cj.taste_map?.favor?.length || 0) === 3, `${cj.taste_map?.favor?.length || 0}`);
  ok('taste avoid = 3', (cj.taste_map?.avoid?.length || 0) === 3, `${cj.taste_map?.avoid?.length || 0}`);

  // additive time_views
  ok('month_overview.summary non-empty', norm(cj.time_views?.month_overview?.summary || '').length > 0, '');
  const themes = cj.time_views?.daily_themes?.length || 0;
  ok('daily_themes pool 3-5', themes >= 3 && themes <= 5, `${themes} themes`);
  ok('paksha notes present', !!(cj.time_views?.paksha?.shukla_note && cj.time_views?.paksha?.krishna_note), '');

  // ---- report ---------------------------------------------------------------
  console.log(`\nDone in ${(ms / 1000).toFixed(1)}s | input_tokens=${response.usage.input_tokens} output_tokens=${response.usage.output_tokens}`);
  console.log(`content_json written to: ${outFile}\n`);
  let failed = 0;
  for (const c of checks) {
    const tag = c.pass ? 'PASS' : 'FAIL';
    if (!c.pass) failed++;
    console.log(`[${tag}] ${c.name}${c.detail ? '  ->  ' + c.detail : ''}`);
  }
  console.log(`\n${failed === 0 ? 'ALL CHECKS PASSED' : failed + ' CHECK(S) FAILED'} (${checks.length - failed}/${checks.length})`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('verify-content-json failed:', e?.message || e);
  process.exit(1);
});
