-- Script de ROLLBACK (à garder en cas de problème)
-- À exécuter UNIQUEMENT si quelque chose ne va pas

-- ========================================
-- ROLLBACK ÉTAPE PAR ÉTAPE
-- ========================================

-- 1. Supprimer la colonne pathology_id de medication_catalog
ALTER TABLE public.medication_catalog
DROP COLUMN IF EXISTS pathology_id;

-- 2. Supprimer l'index
DROP INDEX IF EXISTS idx_medication_catalog_pathology_id;

-- 3. Supprimer la contrainte UNIQUE sur pathologies.name
ALTER TABLE public.pathologies
DROP CONSTRAINT IF EXISTS pathologies_name_unique;

-- 4. Supprimer les pathologies ajoutées par la migration (OPTIONNEL)
-- ⚠️ NE SUPPRIMER QUE SI is_approved = true ET created_by IS NULL
-- ⚠️ Cela préserve tes 5 pathologies originales qui ont created_by renseigné

DELETE FROM public.pathologies
WHERE is_approved = true 
  AND created_by IS NULL
  AND name NOT IN ('Douleur/Fièvre', 'Insomnie', 'Diabète Type 2', 'Cholestérol', 'Anxiété');

-- ========================================
-- VÉRIFICATION POST-ROLLBACK
-- ========================================
SELECT COUNT(*) as remaining_pathologies FROM public.pathologies;
SELECT COUNT(*) as remaining_medications FROM public.medication_catalog;

-- Résultat attendu : 5 pathologies, 5 médicaments (état initial)
