-- Add dosage_amount column to medications table
ALTER TABLE public.medications
ADD COLUMN dosage_amount TEXT;

-- Extract dosage from name and populate dosage_amount
UPDATE public.medications
SET dosage_amount = (
  SELECT substring(name FROM '(\d+(?:/\d+)?(?:mg|g|ml))')
)
WHERE name ~ '\d+(?:/\d+)?(?:mg|g|ml)';

-- Remove dosage from medication names
UPDATE public.medications
SET name = trim(regexp_replace(name, '\s*\d+(?:/\d+)?(?:mg|g|ml)\s*', ' ', 'gi'))
WHERE name ~ '\d+(?:/\d+)?(?:mg|g|ml)';