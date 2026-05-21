-- Add access_token column for web-delivered report URLs.
-- Token is a deterministic SHA-256 of report_id + user_email + MAASIK_REPORT_SECRET
-- (see src/lib/maasik/report-token.ts), stored at generation time so the URL
-- can be reconstructed by the email/cron layer without re-deriving the hash.
-- Apply manually in the Supabase SQL editor.

ALTER TABLE maasik_reports
  ADD COLUMN IF NOT EXISTS access_token TEXT;

CREATE INDEX IF NOT EXISTS maasik_reports_access_token_idx
  ON maasik_reports (access_token)
  WHERE access_token IS NOT NULL;
