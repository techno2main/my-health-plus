-- Make prescription_id nullable in treatments table since it's optional
ALTER TABLE public.treatments 
ALTER COLUMN prescription_id DROP NOT NULL;