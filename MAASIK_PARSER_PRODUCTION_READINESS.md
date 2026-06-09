# Maasik Parser — Production Readiness Report

**Scope:** production-readiness review before wiring the Option A parser into the orchestrator and backfilling reports. Grounded in the committed parser code, the instrumented template (v4.1), and the live `maasik_reports` state (queried 8 Jun 2026).

**Headline findings (read first):**

1. **Historical reports cannot be parser-backfilled.** All 12 stored `report_html` values contain zero `data-slot` hooks (pre-instrumentation) and zero `[[placeholders]]` (already rendered). The parser requires hooks; it will throw `E_HOOK_MISSING` on every historical report. Backfill of the 12 via the parser is not possible, by construction.
2. **The v1 shadow extractor appears to be a no-op in production.** 0 of 12 reports have a `content_json`; every `content_schema_version` is NULL. Either the shadow step never runs or it fails silently (it is non-fatal by design). We are replacing a step that may never have produced output.

These do not block the forward path. They reshape backfill (Section C) and sequencing.

---

## A. Parser Contract Audit

### `parseMaasikReport(html, ctx) -> ParseResult`
- **Inputs:** `html` = a rendered, instrumented v4.1 report string; `ctx: ParseContext` = `{ producer:'maasik', sourceRef, generatedAt, schemaVersion:'maasik.content.v2', templateVersion }`. `generatedAt`/`sourceRef` are injected, never minted.
- **Outputs:** `{ contentJson: ContentJsonV2, integrity: IntegrityReport }`. `contentJson` = `{ schema_version, template_version, source_ref, generated_at, presentation, signals[], directives[] }`. Narrative is absent (merged by orchestrator).
- **Invariants:** pure and deterministic (identical inputs to identical bytes); `integrity.ok === true` on return; all 95 slots resolved; node ids = `maasik:<target>:<semantic_id>`; node/order stable.
- **Failure modes:** `E_CONTEXT_INVALID`, then any Stage-1..4 throw (see below). Never returns a degraded result; throws instead.
- **Downstream consumers:** the orchestrator (`extract-content-json.ts` replacement); persisted to `maasik_reports.content_json`.

### `extract(html) -> ExtractionResult`
- **Inputs:** rendered instrumented HTML.
- **Outputs:** `{ values: Map<semantic_id, ExtractedValue>, hooksFound: string[] }` (the producer-agnostic boundary).
- **Invariants:** only HTML-aware stage; 93 data-slot hooks found exactly once; 2 CSS gradient slots resolved by regex; one `ExtractedValue` per registry entry.
- **Failure modes:** `E_HOOK_DUPLICATE`, `E_HOOK_MISSING`, `E_CSS_SLOT_MISSING`, `E_EXTRACT_SHAPE` (malformed structured/visual node).
- **Downstream consumers:** Stages 2-4; future producers re-enter here by constructing their own `ExtractionResult`.

### `assemblePresentation(x) -> Presentation`
- **Inputs:** `ExtractionResult`.
- **Outputs:** nested object keyed by `presentation_path`; byte-parity fuel for Option C.
- **Invariants:** never mints semantic nodes; never touches HTML; one leaf write per path.
- **Failure modes:** `E_PATH_COLLISION` (two slots target one leaf); defensive `E_HOOK_MISSING`.
- **Downstream consumers:** Option C renderer; app views (Day/Week/Paksha/Month).

### `generateSignals(x, ctx) -> Signal[]`
- **Inputs:** `ExtractionResult` + `ParseContext`.
- **Outputs:** signals in `ROUTING_REGISTRY` order (5 today).
- **Invariants:** interpretation only from the rule; ids from `semantic_id`; `classification`/`evidence` empty in v1; `detail` present iff rule has `body_from`.
- **Failure modes:** `E_ROUTE_UNRESOLVED`, `E_BODYFROM_UNRESOLVED`.
- **Downstream consumers:** content_json `signals[]`; later promoted to shared Supabase tables.

### `generateDirectives(x, ctx) -> Directive[]`
- **Inputs/Outputs:** as above; 15 directives today.
- **Invariants:** `trackable` derived from `kind`; `justified_by`/`serves`/`classification` empty in v1.
- **Failure modes:** `E_ROUTE_UNRESOLVED`, `E_BODYFROM_UNRESOLVED`.
- **Downstream consumers:** content_json `directives[]`; future habit/task linkage.

### `checkIntegrity(x) -> IntegrityReport`
- **Inputs:** `ExtractionResult`.
- **Outputs:** `{ expectedDataSlotHooks:93, foundHooks, missingHooks[], duplicateHooks[], pathCollisions[], unroutableRules[], cssSlotsResolved[], ok }`.
- **Invariants:** independent recomputation; throws on any non-empty failure set; never returns `ok:false` on a happy path.
- **Failure modes:** throws `E_HOOK_DUPLICATE` / `E_HOOK_MISSING` / `E_PATH_COLLISION` / `E_ROUTE_UNRESOLVED` / `E_CSS_SLOT_MISSING`.
- **Downstream consumers:** orchestrator gate; test suite.

---

## B. Dependency Audit

### `node-html-parser@7.1.0` (runtime)
- **Purpose:** parse rendered HTML, select `[data-slot]` nodes, read `text`/`innerHTML` for extraction.
- **Alternatives considered:** `jsdom` (heavy, full DOM, less predictable serialization), `cheerio` (larger tree, jQuery API), regex-only (brittle for `svg-groups` and nested structured rows, hard to keep deterministic).
- **Bundle/runtime impact:** server-only (parser runs in the orchestrator/route, never shipped to the browser). Small, zero native deps. No client bundle impact.
- **Maintenance risk:** low-moderate. Mature, widely used, active. API surface we use (`parse`, `querySelectorAll`, `getAttribute`, `text`, `innerHTML`) is stable and minimal.
- **Lock-in risk:** low. Confined to `extract.ts` + `extractors.ts`. Swapping parsers touches two files; the boundary intermediate is parser-agnostic.

### `vitest@4.1.8` (dev only)
- **Purpose:** run the five contract suites + golden snapshot.
- **Alternatives considered:** Jest (heavier, ts-jest config burden), Node built-in `node:test` + `tsx` (lighter but rougher DX, more wiring), no runner (fails the testing requirement).
- **Bundle/runtime impact:** none. Dev dependency; never in production bundle.
- **Maintenance risk:** low. De facto standard for Vite/Next + TS.
- **Lock-in risk:** low. Tests use standard `describe/it/expect`; portable to Jest with minimal change. Snapshot format is the only Vitest-specific artifact.

Config note: `vitest.config.ts` scopes collection to `src/**/__tests__/**`, isolating the runner from the legacy `validate-html.test.ts` Node script (left untouched).

---

## C. Backfill Safety Plan

**Constraint that dominates this section:** the parser needs `data-slot` hooks; the 12 historical reports have none. The parser is a **forward** mechanism. Historical backfill is therefore a separate, optional track, not a parser run.

**Immutability guarantee (the core safety property):** any backfill writes ONLY to the additive columns `content_json` (currently NULL) and `content_schema_version` (currently NULL). It never writes `report_html`, `report_pdf_url`, or `report_pdf_storage_path`. The delivered artifacts (HTML + PDF) are physically untouchable by backfill. Corruption of a delivered report is therefore impossible by construction, independent of method.

**Options for the 12 historical reports (recommendation = defer, then optional v1-LLM fill):**
- **Do nothing (recommended default).** They are delivered, `content_json` is already NULL, and the dashboard can launch on v2-era reports only. Zero risk.
- **Optional v1-LLM fill.** Run the existing `extractContentJson` on each stored `report_html`, write `content_json` tagged `maasik.content.v1`. Additive, reversible, and clearly versioned as legacy. Does not unify schema but lights up history. P2.
- **Rejected: re-generate.** Re-running generation would change content and break fidelity to what the user actually received. Not allowed.
- **Rejected: structure-based re-parse.** Writing a second parser against the old CSS-class structure is disproportionate effort for 12 delivered reports.

**Forward backfill (v2-era reports, once orchestrator is live):**
- **Strategy:** dual-write at generation time (parser populates `content_json` v2 alongside delivery). No retroactive bulk job needed if we switch before the next generation cycle.
- **Sampling:** before enabling persistence, run the parser in shadow on the next N freshly generated instrumented reports; diff `presentation` against the rendered HTML and eyeball `signals`/`directives`.
- **Parity verification:** golden-snapshot already pins parser output; for live reports, assert `integrity.ok` and that every `[[slot]]`-equivalent value round-trips (presentation leaf equals source node text).
- **Rollback:** `update maasik_reports set content_json = null, content_schema_version = null where ...` restores the prior state exactly. Lossless because no source column is mutated.

---

## D. Orchestrator Impact Analysis

**Current path (`extract-content-json.ts`):** a full second Sonnet call (`claude-sonnet-4-6`, `max_tokens: 32000`, `temp 0.2`) transcribing the entire rendered HTML into v1 content_json. Code self-documents ~8-12K output tokens; input = ~1.5K system (prompt-cached) + the full rendered HTML (~12-15K tokens) + schema skeleton.

**New path:** deterministic parser produces `presentation` + `signals` + `directives` in milliseconds at zero token cost; a trimmed narrative-only LLM call produces the small authored block.

| Metric | Current (v1 LLM transcription) | New (parser + narrative-only) | Reduction |
|---|---|---|---|
| Output tokens / report | ~8,000-12,000 | ~500-1,500 (narrative only) | ~85-90% |
| Input tokens / report | ~14,000-16,000 | ~2,000-4,000 (narrative prompt, no full HTML) | ~75% |
| Cost / report (Sonnet est. $3/M in, $15/M out)* | ~$0.18-0.22 | ~$0.02-0.04 | ~85% |
| Latency (structuring step) | ~15-40 s (full streamed completion) | ~2-5 s (narrative call) + ~ms (parser) | ~80%+ |
| Failure surface | whole document at LLM mercy (truncation, JSON drift, key omission, hallucinated structure) | deterministic for structure; LLM risk confined to the narrative block only | large |

\* Cost rates are representative Sonnet pricing and should be verified against current published pricing before being quoted externally.

Failure-mode reduction is the most important line: today a single `max_tokens` truncation or malformed JSON loses the entire content_json; with the parser, structure cannot truncate or drift, and only the small narrative is exposed to model variance.

---

## E. Versioning Strategy

- **`maasik.content.v1`** (shipped, in code): PDF-section-shaped, LLM-transcribed, 13 required top-level keys (`meta`, `vedic_context`, `cover`, ... `visuals`, `time_views`). Produced by `extract-content-json.ts`. No `signals`/`directives`. Currently unused in the DB (0 rows).
- **`maasik.content.v2`** (this work): three-layer (`presentation` / semantic `signals[]`+`directives[]` / `narrative`), parser-produced for structure, ontology-aligned, deterministic. Stamped `schema_version: 'maasik.content.v2'` + `template_version`.
- **Compatibility expectation:** consumers branch on `content_schema_version`. v1 and v2 coexist row-by-row; no in-place migration of v1 rows is required (and none exist). New reads prefer v2; legacy v1 (if ever produced by the optional historical fill) renders via the old section map.
- **v3 evolution path:** v2 is forward-shaped for the moves already anticipated. Promotion of `signals`/`directives` to shared Supabase tables (when Dinacharya becomes a second producer) is a v3 trigger; field names already match future columns. Routing enrichment (populating `classification`/`confidence`/`justified_by`) is additive and does not require a version bump unless the node shape changes. Rule: structural changes to `presentation` or node shape => new `content_schema_version`; additive optional fields => same version.

---

## F. Technical Debt Register

**P0 (resolve before/at orchestrator wiring):**
- Confirm the instrumented template (v4.1) is the one actually rendering in production before switching the orchestrator; the parser only works on instrumented HTML.
- Verify whether the v1 shadow step currently runs at all (0/12 populated). If it is silently failing, the switch must not inherit the same silent-failure pattern; parser failures should be logged loudly (still non-fatal to delivery).

**P1 (soon after):**
- Routing enrichment: `classification` (pillar to purushartha/compass), `confidence`, and directive-to-signal `justified_by` edges are intentionally empty in v1 of the parser. Add as `ROUTING_REGISTRY` enrichments.
- Entity decoding edge cases in the `text` extractor (e.g. `&amp;`). Current behavior decodes via `.text`; fine for present content, worth a fixture if richer copy appears.
- Real rendered-PDF parity test (Doppio) to convert "provisional" parity into empirical.

**P2 (later / optional):**
- Optional v1-LLM historical fill of the 12 legacy reports (Section C), clearly tagged.
- Cleanup migration dropping the denormalized `maasik_reports.profile_id` (already tracked).
- `node-html-parser` swap insulation is good but undocumented in code comments beyond the module headers.

**Intentional compromises (accepted, not debt to fix):**
- Empty semantic-classification fields in v1 (deliberate "no invented semantics").
- CSS-located gradient slots use a small locator map in `extract.ts` rather than registry fields (extraction mechanics, correctly kept out of the structural registry).
- Day-chart uses a transparent `<g data-slot>` wrapper (only deviation from "attribute on existing element"; visually inert).

---

## Sequencing recommendation (challenge to the proposed order)

Proposed: Review -> Orchestrator Wiring -> Shadow Run -> Backfill -> Dashboard.

Recommended adjustment:

1. **Production Readiness Review** (this document).
2. **Deploy + confirm instrumented template is live.** Insert before wiring. The parser is inert until v4.1 HTML is what production renders. Confirm a freshly generated report contains 93 hooks.
3. **Orchestrator wiring in dual-extraction (shadow) mode.** Wire the parser to run alongside the existing path, persisting v2 `content_json` while NOT removing the v1 call yet. Log parser `integrity` and any throw.
4. **Shadow Run Validation.** Compare parser output against rendered HTML on the next several live reports; assert `integrity.ok` and presentation parity.
5. **Cut over.** Replace the v1 transcription with parser + narrative-only once shadow is clean; drop the heavy LLM call.
6. **Historical backfill = optional, de-scoped.** Reframed: not a parser job. Either skip (recommended) or run the optional v1-LLM fill. Do NOT block the dashboard on it.
7. **Dashboard Integration** on v2-era reports.

The one safety change versus your order: make "confirm instrumented template is live in production" an explicit gate before wiring, and run the wiring itself in shadow before cutover. And treat historical backfill as optional and non-blocking, because the parser cannot touch the 12 legacy reports and their delivered artifacts must stay immutable.
