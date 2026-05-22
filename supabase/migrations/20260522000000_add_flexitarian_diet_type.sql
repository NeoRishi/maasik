-- Allow 'flexitarian' as a valid diet_type. The onboarding form (Q21) and Zod
-- validation already include this value, but the original CHECK constraint
-- omitted it, causing inserts to fail for users who pick "Flexitarian".

ALTER TABLE maasik_users
  DROP CONSTRAINT IF EXISTS maasik_users_diet_type_check;

ALTER TABLE maasik_users
  ADD CONSTRAINT maasik_users_diet_type_check
  CHECK (diet_type = ANY (ARRAY[
    'vegetarian'::text,
    'eggetarian'::text,
    'non_vegetarian'::text,
    'vegan'::text,
    'flexitarian'::text,
    'unspecified'::text
  ]));
