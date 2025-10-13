-- Add catalog_id column to medications table to link with medication_catalog
ALTER TABLE public.medications 
ADD COLUMN catalog_id UUID REFERENCES public.medication_catalog(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_medications_catalog_id ON public.medications(catalog_id);

-- Update existing medications to link with catalog based on name match (best effort)
UPDATE public.medications m
SET catalog_id = mc.id
FROM public.medication_catalog mc
WHERE LOWER(TRIM(m.name)) = LOWER(TRIM(mc.name))
  AND m.catalog_id IS NULL;