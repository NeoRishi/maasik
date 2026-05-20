-- Add phone column to maasik_users for WhatsApp/mobile capture at onboarding.
-- Stored in E.164 format (e.g. +919812345678). Indian numbers only at v1.
-- Apply manually in the Supabase SQL editor; this repo does not run migrations automatically.

ALTER TABLE maasik_users
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS maasik_users_phone_idx ON maasik_users (phone);

COMMENT ON COLUMN maasik_users.phone IS
  'E.164-formatted mobile/WhatsApp number, e.g. +919812345678. Indian numbers only at v1.';
