-- =====================================================
-- CORRECTION: Optimisation des RLS policies pour éviter les warnings
-- Suppression des appels répétés à auth.uid() 
-- Date: 2025-11-03
-- =====================================================

-- Fix pathologies RLS policy - Optimisation performance
DROP POLICY IF EXISTS "pathologies_read" ON public.pathologies;
CREATE POLICY "pathologies_read"
  ON public.pathologies FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid()) OR 
    is_approved = true
  );

-- Fix allergies RLS policy - Optimisation performance
DROP POLICY IF EXISTS "allergies_read" ON public.allergies;
CREATE POLICY "allergies_read"
  ON public.allergies FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid()) OR 
    is_approved = true
  );

-- Fix medication_catalog RLS policy - Optimisation performance
DROP POLICY IF EXISTS "medication_catalog_read" ON public.medication_catalog;
CREATE POLICY "medication_catalog_read"
  ON public.medication_catalog FOR SELECT
  TO authenticated
  USING (
    created_by = (SELECT auth.uid()) OR 
    is_approved = true
  );