-- Add severity column to pathologies table
ALTER TABLE public.pathologies 
ADD COLUMN severity TEXT;

-- Add comment
COMMENT ON COLUMN public.pathologies.severity IS 'Type de pathologie: Récurrente, Temporaire, ou Ponctuelle';
