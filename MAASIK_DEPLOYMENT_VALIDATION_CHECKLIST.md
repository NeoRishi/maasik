# Maasik Parser — Deployment Validation Checklist

**Goal:** prove the production generation path emits instrumented HTML and the parser shadow-executes correctly, before any cutover. Optimize for reducing unknowns, not for new features.

**The single biggest unknown:** does the generation model reproduce the 93 `data-slot` attributes verbatim when it fills the template? Everything below is built to answer that empirically.

---

## 1. Preconditions before deploy

### Files changed (Maasik repo)
Modified:
- `src/lib/maasik/html-template.ts` (v4.0 -> v4.1, 93 `data-slot` hooks + 2 CSS gradient slots)
- `src/app/api/generate-report/route.ts` (2 imports + guarded shadow step #14)
- `package.json` (`node-html-parser` runtime dep, `vitest` dev dep, `test`/`test:watch` scripts)
- `package-lock.json`

New (must all be committed or the build fails):
- `src/lib/intelligence/` (ontology.ts, routing.ts, util.ts, index.ts)
- `src/lib/maasik/parser/` (index, types, extract, extractors, presentation, signals, directives, integrity, node-build, util, `__fixtures__/`, `__tests__/`)
- `src/lib/maasik/slot-registry.ts`, `src/lib/maasik/routing-registry.ts`
- `vitest.config.ts`
- **`src/lib/maasik/content-json-prompt.ts` and `src/lib/maasik/extract-content-json.ts`** — these are imported by the route but were left untracked in a prior session. Commit them now or the deploy build cannot resolve the import.

### Migrations required
- **None new.** The shadow step writes only to `maasik_events`, and `content_json` / `content_schema_version` already exist on `maasik_reports`.
- The only DB change this work introduced (the `maasik_reports` join-through RLS policy, `20260607010000`) is **already applied** to the live DB. Verify it is still present (Section 5 has the query).

### Feature flags
- **None.** The shadow step is unconditional but self-gating (`html.includes('data-slot')`) and fully `try/catch` wrapped: it cannot affect PDF generation or email delivery. There is intentionally no flag because the step is non-fatal by construction. (If you want an explicit kill switch later, an env check is a one-line add, but it is not required for safety.)

### Environment dependencies
- `node-html-parser@^7.1.0` is in `dependencies` (confirmed), so Vercel installs it for the server bundle. The route is `runtime = 'nodejs'` (not edge), where `node-html-parser` runs.
- `vitest` is `devDependency` only (not shipped).
- No new environment variables. Existing Anthropic / Supabase / Resend / Doppio / Razorpay vars are unchanged.

### Pre-deploy gates
- [ ] `npm run build` succeeds locally or in CI (Next typechecks; this catches the route's new imports and the registries' load-time assertions).
- [ ] `npm test` is green (11 parser tests).
- [ ] All new files above are staged and committed.
- [ ] Confirm `HTML_TEMPLATE_VERSION === 'v4.1'` in the commit being deployed.

---

## 2. Post-deploy verification

Run these against the deployed app. Validation requires a **fresh** generation (Path B), so pass `force_regenerate: true` to avoid the reused-HTML path (Path A serves old v4.0 HTML and will log `_shadow_skipped`).

### 2a. Confirm v4.1 template is actually being used
Generate one report, then:
```sql
select id, created_at,
       (length(report_html) - length(replace(report_html, 'data-slot', ''))) / length('data-slot') as data_slot_count
from maasik_reports
order by created_at desc
limit 1;
```
Expected: `data_slot_count = 93`. Zero means the deploy did not pick up v4.1 or the reused-HTML path ran.

### 2b. Confirm data-slot attributes survive generation
Same query as 2a: `data_slot_count = 93` is the direct proof the model reproduced every hook. Also confirm the 2 CSS gradients survived:
```sql
select id,
       (report_html ~ 'at 70% 20%,\s*rgba\(') as accent_ok,
       (report_html ~ 'at 30% 80%,\s*rgba\(') as primary_ok
from maasik_reports order by created_at desc limit 1;
```
Expected: both `true`.

### 2c. Confirm parser shadow execution occurred
```sql
select event_type, event_data
from maasik_events
where event_type like 'content_json_v2_shadow%'
order by created_at desc
limit 5;
```
Expected: a `content_json_v2_shadow` row for the new report (not `_skipped`, not `_failed`).

### 2d. Confirm telemetry is recorded correctly
The `content_json_v2_shadow` `event_data` must contain:
- `integrity_ok: true`
- `hooks_found: 93`
- `signals: 5`
- `directives: 15`
- `template_version: "v4.1"`

---

## 3. Shadow-validation procedure

### How many reports
Generate **at least 10 fresh reports, target 20**, spanning different users / ritus / archetypes (different seasonal content stresses different slots: taste names, anchor counts, grocery cards, SVG shapes). Use `force_regenerate: true` each time so every run is a true Path-B generation.

### Pass / fail thresholds
- **Hook integrity (the model-fidelity test): must be 0 failures.** Every report must produce `content_json_v2_shadow` with `integrity_ok = true` and `hooks_found = 93`. Any `content_json_v2_shadow_failed` with code `E_HOOK_MISSING` or `E_HOOK_DUPLICATE` means the model dropped or duplicated an attribute. This is the unknown we are deliberately measuring; it must be driven to zero before cutover.
- **Structured-shape (`E_EXTRACT_SHAPE`): investigate, not necessarily blocking.** Means the model produced malformed rows (e.g. a food `<li>` without `<strong>`). Fixable via prompt reinforcement; track separately from hook integrity.
- `_shadow_skipped` rows are expected and benign (reused-HTML path).

### Expected telemetry values (per successful report)
`integrity_ok=true`, `hooks_found=93`, `signals=5`, `directives=15`, `template_version="v4.1"`.

Aggregate check:
```sql
select event_type, count(*),
       avg((event_data->>'hooks_found')::int)        as avg_hooks,
       min((event_data->>'hooks_found')::int)        as min_hooks,
       avg((event_data->>'signals')::int)            as avg_signals,
       avg((event_data->>'directives')::int)         as avg_directives,
       bool_and((event_data->>'integrity_ok')::boolean) as all_ok
from maasik_events
where event_type like 'content_json_v2_shadow%'
group by event_type;
```

### Investigation workflow on failure
1. Read the `content_json_v2_shadow_failed` row's `event_data.code` and `event_data.reason` (the reason names the exact slot).
2. Pull that report's `report_html` and locate the named hook: is the `data-slot` attribute missing, duplicated, or is the inner structure malformed?
3. Classify: missing/duplicate attribute = model fidelity (prompt fix: strengthen the reproduce-verbatim instruction in `user-message.ts` / `system-prompt.ts`); malformed rows = `E_EXTRACT_SHAPE` (prompt fix on the row-format instruction). Neither is a parser bug.
4. Re-generate the same user and confirm the event flips to success. Do not change parser code to accommodate model drift; fix the prompt.

---

## 4. Cutover readiness criteria

Do not replace v1 extraction until all of these hold:
- **Sample size:** at least 20 fresh Path-B reports observed in shadow.
- **Hook-integrity failure rate: 0%** across the sample (`hooks_found = 93`, `integrity_ok = true` for every one). Because a hook failure means that report's `content_json` would be null, and because it signals systematic model drift, this metric must be clean, not merely low.
- **`E_EXTRACT_SHAPE` rate: < 5%**, and any occurrence has a known, prompt-level cause.
- **Presentation parity spot-check:** manually compare 3 reports' parsed `presentation` values (reconstruct via the parser locally on the stored `report_html`) against the rendered PDF; verbatim match on a sample of scalar, structured, and visual slots.
- **Determinism:** re-parsing the same stored `report_html` twice yields byte-identical `content_json` (already covered by the test suite; re-confirm on one real report).

Only then proceed to: write `content_json` from the parser, shrink the LLM call to narrative-only, retire `extractContentJson`.

---

## 5. Rollback procedure

The shadow step is non-destructive: it writes only `maasik_events` rows and never touches `report_html`, `content_json`, the PDF, or delivery. So rollback is low-stakes.

### Steps
1. **Code rollback (if needed):** redeploy the previous commit (pre-v4.1). New reports revert to the v4.0 template (no hooks) and the shadow step disappears. Delivery is unaffected either way.
2. **No data migration to undo.** No schema changed; no `content_json` was written by shadow.
3. **Optional telemetry cleanup:**
   ```sql
   delete from maasik_events where event_type like 'content_json_v2_shadow%';
   ```

### What data is affected
- Only `maasik_events` shadow rows (additive, deletable).
- Reports generated while v4.1 was live keep `data-slot` in their stored `report_html`. This is visually inert (attributes do not affect the PDF), so already-delivered v4.1 reports need no remediation after a rollback.
- The RLS join-through policy is independent and stays in place.

### Verify rollback success
```sql
-- new reports no longer instrumented
select (length(report_html) - length(replace(report_html,'data-slot',''))) / length('data-slot') as data_slot_count
from maasik_reports order by created_at desc limit 1;   -- expect 0 after rollback

-- no new shadow events after the rollback timestamp
select count(*) from maasik_events
where event_type like 'content_json_v2_shadow%' and created_at > '<rollback_ts>';   -- expect 0

-- RLS policy still present
select policyname from pg_policies
where schemaname='public' and tablename='maasik_reports' and policyname='maasik_reports_owner_select';
```

---

## Summary of what is being proven

End-to-end, in a real deploy: (1) the v4.1 template renders in production, (2) the model reproduces all 93 `data-slot` hooks under real content variation, (3) the parser shadow-executes deterministically and records clean telemetry, with (4) zero risk to the paid delivery path and a trivial rollback. Passing this is the milestone; narrative-only extraction, cutover, dashboard, and future producers all wait behind it.
