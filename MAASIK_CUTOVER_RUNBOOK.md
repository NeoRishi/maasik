# Maasik content_json v2 Cutover, Validation Runbook
**Date:** 10 June 2026

## What changed (commit `2dbae5b` on `maasik-dev`)

1. `generate-report` now WRITES `content_json` v2 (it was shadow-only before). Primary path: deterministic parser on instrumented HTML. Fallback: v1 LLM transcription lifted to v2 by `src/lib/maasik/v1-to-v2.ts`. Either way, every new report lands as `maasik.content.v2`, which is the only schema the NeoRishi app renders.
2. New `GET /api/backfill-content-json` backfills v2 for all historical (hook-less) reports, latest report per user first. Auth: `Authorization: Bearer $CRON_SECRET`. Limit 3 per call. Idempotent.
3. DB triggers (already live, applied via MCP): new NeoRishi signups adopt existing Maasik rows by email, new Maasik onboardings adopt existing profiles, and new reports inherit `profile_id`. No manual linking ever again.

## Validation path (run in order)

### 1. Deploy producer
```bash
cd Maasik
git push origin maasik-dev
# then merge maasik-dev -> main (same as PR #8) and wait for the Vercel deploy
curl -s https://maasik.neorishi.io/api/health
```

### 2. Backfill historical reports (8 users pending)
```bash
# Dry run first: shows what would be processed, changes nothing
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "https://maasik.neorishi.io/api/backfill-content-json?dry=true"

# Then run it for real, 3 reports per call. Each costs one Claude call
# (1-2 min). Repeat until remaining_estimate is 0 (3 calls for 8 users).
curl -s -m 800 -H "Authorization: Bearer $CRON_SECRET" \
  "https://maasik.neorishi.io/api/backfill-content-json?limit=3"
```

### 3. Verify content_json generated (SQL editor or ask Claude)
```sql
select mu.email, r.vedic_month, r.content_schema_version,
       (r.content_json is not null) as has_json,
       r.content_json->'presentation'->'archetype'->>'name' as archetype
from maasik_reports r join maasik_users mu on mu.id = r.user_id
order by r.created_at desc;
-- Expect: every user's latest report shows maasik.content.v2 + an archetype.
-- Also check maasik_events for content_json_backfilled / _backfill_failed.
```

### 4. Generate a fresh report end-to-end
```bash
curl -s -m 800 -X POST -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<your test maasik_users.id>"}' \
  https://maasik.neorishi.io/api/generate-report-test
```
Then confirm in `maasik_events`: a `content_json_v2_parsed` event (parser path, `integrity_ok: true`) followed by `content_json_generated` with `path: "parser"`. If you instead see `path: "v1_convert"`, the parser fell back; check the `content_json_v2_parse_failed` event for the error code.

### 5. Verify Month + Paksha views render real data
Log in at neorishi.io as srkf555@gmail.com (already backfilled) or any backfilled user, open `/app/maasik`:
- No "Sample" ribbon anywhere.
- Month tab: archetype card shows the user's real archetype (srkf555: "The Slow River"), real grocery lists, real anchors.
- Paksha tab: renders with the report's actual paksha (header chip shows "Shukla Paksha" for current reports).
- A signed-in user with NO report (e.g. a fresh NeoRishi account with no Maasik subscription) now sees the "Your Maasik blueprint is on its way" empty state, never sample data.

## Ongoing behavior after cutover
- Monthly cron generates a report, writes v2 content_json in the same run. The NeoRishi dashboard picks it up with zero manual steps.
- New Maasik onboarding (Tally) for someone who already has a NeoRishi account: linked at insert time by trigger; their report appears in-app the moment it is generated.
- New NeoRishi signup by an existing Maasik subscriber: their past reports and identity link at signup by trigger.

## Rollback
- Producer: revert commit `2dbae5b` (the old shadow-only behavior returns).
- Backfilled rows: `update maasik_reports set content_json = null, content_schema_version = null where content_json->>'template_version' = 'v1-llm-extraction-converted';`
- Triggers: drop statements are listed at the bottom of migration `20260610100000_maasik_identity_autolink_triggers.sql` in the NeoRishi repo.
