-- ============================================================================
-- MIGRATION DES NOTES DE LA TABLE medication_intakes
-- Date: 10 décembre 2025
-- Objectif: Harmoniser toutes les notes selon le nouveau référentiel
-- ============================================================================

-- BACKUP: Créer une sauvegarde avant modification
-- CREATE TABLE medication_intakes_backup AS SELECT * FROM medication_intakes;

BEGIN;

-- ============================================================================
-- 1. STATUS = 'pending' : Ajouter "En attente de traitement"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'En attente de traitement',
    updated_at = NOW()
WHERE status = 'pending'
  AND (notes IS NULL OR notes = '');

-- Résultat attendu: ~80+ enregistrements

-- ============================================================================
-- 2. STATUS = 'skipped' : Uniformiser en "Prise sautée volontairement"
-- ============================================================================

-- 2a. Notes vides
UPDATE medication_intakes
SET notes = 'Prise sautée volontairement',
    updated_at = NOW()
WHERE status = 'skipped'
  AND (notes IS NULL OR notes = '');

-- 2b. Anciennes notes "Rattrapage - Marqué comme manqué"
UPDATE medication_intakes
SET notes = 'Prise sautée volontairement',
    updated_at = NOW()
WHERE status = 'skipped'
  AND notes = 'Rattrapage - Marqué comme manqué';

-- Résultat attendu: 1-2 enregistrements

-- ============================================================================
-- 3. STATUS = 'taken' AVEC NOTES VIDES : "Pris à l'heure, à HH:mm"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'Pris à l''heure, à ' || TO_CHAR(taken_at AT TIME ZONE 'Europe/Paris', 'HH24:MI'),
    updated_at = NOW()
WHERE status = 'taken'
  AND (notes IS NULL OR notes = '')
  AND taken_at IS NOT NULL;

-- Résultat attendu: ~100+ enregistrements

-- ============================================================================
-- 4. RATTRAPAGE : "Pris en rattrapage" → "Rattrapage - Marquée comme pris à HH:mm"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'Rattrapage - Marquée comme pris à ' || TO_CHAR(taken_at AT TIME ZONE 'Europe/Paris', 'HH24:MI'),
    updated_at = NOW()
WHERE status = 'taken'
  AND notes = 'Pris en rattrapage'
  AND taken_at IS NOT NULL;

-- Résultat attendu: 0-5 enregistrements (note récente)

-- ============================================================================
-- 5. RATTRAPAGE : "Rattrapage - Pris avec retard" → "Rattrapage - Prise avec retard à HH:mm"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'Rattrapage - Prise avec retard à ' || TO_CHAR(taken_at AT TIME ZONE 'Europe/Paris', 'HH24:MI'),
    updated_at = NOW()
WHERE status = 'taken'
  AND notes = 'Rattrapage - Pris avec retard'
  AND taken_at IS NOT NULL;

-- Résultat attendu: 6 enregistrements

-- ============================================================================
-- 6. RATTRAPAGE : "Rattrapage - Marqué comme pris à l'heure prévue" 
--    → "Rattrapage - Marquée comme pris à l'heure prévue HH:mm"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'Rattrapage - Marquée comme pris à l''heure prévue ' || TO_CHAR(scheduled_time AT TIME ZONE 'Europe/Paris', 'HH24:MI'),
    updated_at = NOW()
WHERE status = 'taken'
  AND notes = 'Rattrapage - Marqué comme pris à l''heure prévue';

-- Résultat attendu: 3 enregistrements

-- ============================================================================
-- 7. RATTRAPAGE : "Pris à l'heure prévue (marqué en retard)"
--    → "Rattrapage - Marquée comme pris à l'heure prévue HH:mm"
-- ============================================================================
UPDATE medication_intakes
SET notes = 'Rattrapage - Marquée comme pris à l''heure prévue ' || TO_CHAR(scheduled_time AT TIME ZONE 'Europe/Paris', 'HH24:MI'),
    updated_at = NOW()
WHERE status = 'taken'
  AND notes = 'Pris à l''heure prévue (marqué en retard)';

-- Résultat attendu: 2 enregistrements

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

-- Vérifier la répartition des notes après migration
SELECT 
    status,
    CASE 
        WHEN notes IS NULL THEN '(null)'
        WHEN notes = '' THEN '(vide)'
        ELSE LEFT(notes, 50)
    END as note_preview,
    COUNT(*) as count
FROM medication_intakes
GROUP BY status, notes
ORDER BY status, count DESC;

-- Vérifier qu'il ne reste plus de notes vides pour status taken/skipped
SELECT COUNT(*) as remaining_empty_notes
FROM medication_intakes
WHERE status IN ('taken', 'skipped')
  AND (notes IS NULL OR notes = '');
-- Résultat attendu: 0

-- Vérifier qu'il ne reste plus d'anciennes notes de rattrapage
SELECT COUNT(*) as remaining_old_catchup_notes
FROM medication_intakes
WHERE notes IN (
    'Pris en rattrapage',
    'Rattrapage - Pris avec retard',
    'Rattrapage - Marqué comme pris à l''heure prévue',
    'Rattrapage - Marqué comme manqué',
    'Pris à l''heure prévue (marqué en retard)'
);
-- Résultat attendu: 0

COMMIT;

-- En cas de problème, annuler avec:
-- ROLLBACK;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
