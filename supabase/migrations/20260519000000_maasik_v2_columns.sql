-- MAASIK v2 report schema additions.
-- Extends maasik_reports with edition-level metadata (archetype, word origins used)
-- and renames the issue counter conceptually to edition_number without dropping the
-- legacy column. v1 rows keep issue_number; new code reads edition_number.
-- Apply manually in the Supabase SQL editor; this repo does not run migrations automatically.

ALTER TABLE maasik_reports
  ADD COLUMN IF NOT EXISTS archetype_name TEXT;

ALTER TABLE maasik_reports
  ADD COLUMN IF NOT EXISTS word_origins_used TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE maasik_reports
  ADD COLUMN IF NOT EXISTS edition_number INTEGER;

ALTER TABLE maasik_reports
  ALTER COLUMN generation_prompt_version SET DEFAULT 'v2.0';

COMMENT ON COLUMN maasik_reports.archetype_name IS
  'Archetype Claude assigned for this edition (v2+). Null for v1 reports.';

COMMENT ON COLUMN maasik_reports.word_origins_used IS
  'Sanskrit terms used in this edition''s word-origin cards (v2+). Empty array if none.';

COMMENT ON COLUMN maasik_reports.edition_number IS
  'v2 successor to issue_number. Backfill: edition_number = issue_number for v1 rows.';
