-- Create pathologies table
CREATE TABLE public.pathologies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pathologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view pathologies"
ON public.pathologies
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add pathologies"
ON public.pathologies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pathologies"
ON public.pathologies
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pathologies"
ON public.pathologies
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create allergies table
CREATE TABLE public.allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  severity TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view allergies"
ON public.allergies
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add allergies"
ON public.allergies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update allergies"
ON public.allergies
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete allergies"
ON public.allergies
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Add new fields to medication_catalog
ALTER TABLE public.medication_catalog
ADD COLUMN form TEXT,
ADD COLUMN color TEXT,
ADD COLUMN dosage_amount TEXT;

-- Update timestamp trigger for pathologies
CREATE TRIGGER update_pathologies_updated_at
BEFORE UPDATE ON public.pathologies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for allergies
CREATE TRIGGER update_allergies_updated_at
BEFORE UPDATE ON public.allergies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();