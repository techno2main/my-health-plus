-- =====================================================
-- TABLE: public.medication_catalog
-- Catalogue des médicaments
-- Date: 29 octobre 2025
-- =====================================================

-- DROP EXISTING
DROP TABLE IF EXISTS public.medication_catalog CASCADE;

-- CREATE TABLE
CREATE TABLE public.medication_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pathology_id UUID REFERENCES public.pathologies(id) ON DELETE SET NULL,
  default_posology TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  form TEXT,
  color TEXT,
  strength TEXT,
  initial_stock INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 10,
  default_times TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.medication_catalog IS 'Catalogue centralisé des médicaments disponibles';
COMMENT ON COLUMN public.medication_catalog.pathology_id IS 'Référence UUID vers la table pathologies';

-- ENABLE RLS
ALTER TABLE public.medication_catalog ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "medication_catalog_read"
  ON public.medication_catalog FOR SELECT
  USING (true);

CREATE POLICY "medication_catalog_create"
  ON public.medication_catalog FOR INSERT
  WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "medication_catalog_modify"
  ON public.medication_catalog FOR UPDATE
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "medication_catalog_remove"
  ON public.medication_catalog FOR DELETE
  USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- TRIGGER
CREATE TRIGGER update_medication_catalog_updated_at 
  BEFORE UPDATE ON public.medication_catalog
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- CREATE INDEX
CREATE INDEX idx_medication_catalog_pathology_id 
ON public.medication_catalog(pathology_id);

-- INSERT DATA
INSERT INTO "public"."medication_catalog" ("id", "name", "pathology_id", "default_posology", "description", "created_at", "updated_at", "form", "color", "strength", "initial_stock", "min_threshold", "default_times", "is_approved", "created_by") 
VALUES 
('20cdc76f-4e18-403c-b05a-71ebd662c620', 'Xigduo', 'dc47c6b3-2245-486d-ad45-c014e8d15b27', '1 comprimé matin et soir', 'Diabète Type 2', '2025-10-13 12:41:41.333622+00', '2025-10-20 18:32:40.553536+00', null, null, '5mg/1000mg', '0', '10', '{"09:30","20:00"}', 'false', null),
('61a5e9aa-7a8a-4258-9d07-6fc8dde6e42e', 'Doliprane', '51051513-8f8d-4999-9465-f2d1a3e6f2e9', '1 comprimé matin, midi et soir', null, '2025-10-26 11:08:34.629837+00', '2025-10-26 11:08:34.629837+00', null, null, '1mg', '0', '10', '{"09:30","12:30","19:30"}', 'false', null),
('6a21de1a-3381-4923-b4c2-194ac8008ae8', 'Quviviq', 'a8560fee-3b94-4701-8752-8a6a292b9ab7', '1 comprimé au coucher', 'Troubles du Sommeil', '2025-10-13 16:41:06.990099+00', '2025-10-19 19:36:43.669411+00', null, null, '50mg', '0', '10', '{"22:00"}', 'false', null),
('c5be88b2-d692-4a1d-8a7c-134a043ab0cd', 'Venlafaxine', 'e9079dce-7d53-41e1-af5c-1fffd9c7c238', '1 comprimé au coucher', 'Anxiété chronique', '2025-10-13 16:41:43.414395+00', '2025-10-20 18:30:45.731075+00', null, null, '225mg', '0', '10', '{"22:00"}', 'false', null),
('e145c2c2-2c49-4521-9dc0-89b9f2f3c54a', 'Simvastatine', 'dcb3503e-ac56-42e7-ade1-d75c05926f96', '1 comprimé le soir', 'Cholestérol', '2025-10-13 12:41:41.333622+00', '2025-10-20 18:32:54.811993+00', null, null, '10mg', '0', '7', '{"20:00"}', 'false', null);
