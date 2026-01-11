-- Script de vérification AVANT migration
-- À exécuter dans Supabase SQL Editor

-- ========================================
-- 1. VÉRIFIER LES DOUBLONS DANS PATHOLOGIES
-- ========================================
SELECT name, COUNT(*) as count
FROM public.pathologies
GROUP BY name
HAVING COUNT(*) > 1;

-- Si ce résultat est vide, OK pour la contrainte UNIQUE
-- Si ce résultat contient des lignes, il faut fusionner les doublons avant

-- ========================================
-- 2. COMPTER LES PATHOLOGIES ACTUELLES
-- ========================================
SELECT 
  COUNT(*) as total_pathologies,
  COUNT(CASE WHEN is_approved = true THEN 1 END) as approved,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as user_created
FROM public.pathologies;

-- ========================================
-- 3. LISTER TOUTES LES PATHOLOGIES ACTUELLES
-- ========================================
SELECT id, name, severity, is_approved, created_by
FROM public.pathologies
ORDER BY name;

-- ========================================
-- 4. VÉRIFIER SI pathology_id EXISTE DÉJÀ DANS medication_catalog
-- ========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medication_catalog' 
  AND column_name = 'pathology_id';

-- Si résultat vide, la colonne n'existe pas (OK)
-- Si résultat non vide, la colonne existe déjà (vérifier qu'elle est nullable)

-- ========================================
-- 5. COMPTER LES MÉDICAMENTS ACTUELS
-- ========================================
SELECT 
  COUNT(*) as total_medications,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as user_created
FROM public.medication_catalog;

-- ========================================
-- 6. LISTER TOUS LES MÉDICAMENTS ACTUELS
-- ========================================
SELECT id, name, strength, pathology, created_by
FROM public.medication_catalog
ORDER BY name;

-- ========================================
-- RÉSULTATS ATTENDUS POUR VALIDATION :
-- ========================================
-- Query 1 : 0 ligne (pas de doublons)
-- Query 2 : 5 pathologies totales
-- Query 3 : 5 lignes (Douleur/Fièvre, Insomnie, Diabète Type 2, Cholestérol, Anxiété)
-- Query 4 : 0 ligne (colonne pathology_id n'existe pas encore)
-- Query 5 : 5 médicaments totales
-- Query 6 : 5 lignes (Xigduo, Doliprane, Quviviq, Venlafaxine, Simvastatine)
