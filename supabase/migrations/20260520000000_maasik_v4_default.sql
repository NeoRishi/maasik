-- MAASIK v4 default-version bump.
-- v4 keeps the v2 schema (no new columns) and only refines the HTML template
-- (cover gradient slots emit literal rgba() instead of CSS-var indirection)
-- plus tightens the post-generation validator. Bumps the default so any new
-- maasik_reports rows recorded without an explicit version are tagged 'v4.0'.
-- Existing rows keep their original 'v1.x' / 'v2.0' provenance; do NOT backfill.
-- Apply manually in the Supabase SQL editor.

ALTER TABLE maasik_reports
  ALTER COLUMN generation_prompt_version SET DEFAULT 'v4.0';
