# Maasik Technical Debt Register

## TD-001 — Activate parser path in production
**Status:** PARKED (accepted as non-blocking, 12 Jun 2026)
**Production behavior until closed:** every report's content_json v2 is produced by the `v1_convert` fallback (LLM transcription + deterministic conversion). Proven across 10/10 users and one fresh production generation. No user-visible impact.

**Root cause:** the instrumented template (`html-template.ts`, HTML_TEMPLATE_VERSION v4.1, 82 `data-slot` hooks) IS delivered to the model inside `<output_template>` (user-message.ts), but the system prompt (v4.0, 720 lines) never instructs preservation of `data-slot` attributes and its inline section examples show markup without them. The model therefore emits hook-less HTML, `html.includes('data-slot')` is false, and the deployed parser path never engages.

**Files involved:**
- `src/lib/maasik/system-prompt.ts` — add one ABSOLUTE RULE: preserve every `data-slot` / `data-css-slot` attribute verbatim, never add/remove/rename/relocate; bump SYSTEM_PROMPT_VERSION to v4.2.
- `src/lib/maasik/validate-html.ts` — add hook-count integrity check (expect 93 per MAASIK_PARSER_PRODUCTION_READINESS.md) so stripped output is flagged, not silent.
- `src/app/api/generate-report/route.ts` — bump GENERATION_PROMPT_VERSION only. No orchestrator logic changes (parser self-activates on hooks).

**Effort estimate:** 20-30 LOC; 1-2 hours total, dominated by verification: one `force_regenerate` test run, expect `content_json_v2_parsed` (integrity_ok true) + `content_json_generated` with `path: "parser"`, plus visual QA of one PDF.

**Rollback:** two layers. Automatic: parser failure falls back to `v1_convert` in the same run (proven in production). Manual: revert the prompt commit and redeploy (minutes). Existing rows are never touched.

**Target completion:** before the next monthly cron generation window (Ashadha editions, ~mid-July 2026), bundled with the next producer deploy. Hard deadline: 10 July 2026.

**Benefit when closed:** deterministic extraction (no second LLM call), ~2 min less latency and one Claude call less per report, byte-stable content_json for downstream views.
