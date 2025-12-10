-- ====================================================================
-- Script de migration v2 : Harmonisation des notes résiduelles
-- Date : 10 décembre 2025
-- ====================================================================
-- Objectif : Harmoniser les notes qui n'ont pas été converties lors 
--            de la première migration
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. CORRECTION DES NOTES "MISSED" (4 enregistrements)
-- ====================================================================
-- Ancien format : "Rattrapage - Marqué comme manqué"
-- Nouveau format : "Rattrapage - Marquée comme manquée"
-- ====================================================================

UPDATE medication_intakes
SET 
  notes = 'Rattrapage - Marquée comme manquée',
  updated_at = NOW()
WHERE 
  status = 'missed' 
  AND notes = 'Rattrapage - Marqué comme manqué';

-- Vérification
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM medication_intakes
  WHERE notes = 'Rattrapage - Marquée comme manquée';
  
  RAISE NOTICE '✓ Enregistrements "Marquée comme manquée" : %', v_count;
END $$;


-- ====================================================================
-- 2. HARMONISATION DES ANCIENS FORMATS DE RATTRAPAGE (~30 enregistrements)
-- ====================================================================
-- Ancien format : "Pris à 23:45 (déclaré en retard)"
-- Nouveau format : "Rattrapage - Prise avec retard à 23:45"
-- ====================================================================

-- Conversion avec extraction de l'heure via REGEX
UPDATE medication_intakes
SET 
  notes = 'Rattrapage - Prise avec retard à ' || 
          (SELECT (regexp_match(notes, 'Pris à (\d{2}:\d{2})'))[1]),
  updated_at = NOW()
WHERE 
  status = 'taken'
  AND notes ~ '^Pris à \d{2}:\d{2} \(déclaré en retard\)$';

-- Vérification
DO $$
DECLARE
  v_count_old INTEGER;
  v_count_new INTEGER;
BEGIN
  -- Compte les anciens formats restants (devrait être 0)
  SELECT COUNT(*) INTO v_count_old
  FROM medication_intakes
  WHERE notes ~ '^Pris à \d{2}:\d{2} \(déclaré en retard\)$';
  
  -- Compte les nouveaux formats créés
  SELECT COUNT(*) INTO v_count_new
  FROM medication_intakes
  WHERE notes ~ '^Rattrapage - Prise avec retard à \d{2}:\d{2}$';
  
  RAISE NOTICE '✓ Anciens formats restants : % (devrait être 0)', v_count_old;
  RAISE NOTICE '✓ Total "Prise avec retard" : %', v_count_new;
END $$;


-- ====================================================================
-- 3. RAPPORT FINAL - TOUTES LES NOTES
-- ====================================================================

DO $$
DECLARE
  v_total INTEGER;
  v_pending INTEGER;
  v_taken_normal INTEGER;
  v_skipped INTEGER;
  v_missed INTEGER;
  v_rattrapage_pris INTEGER;
  v_rattrapage_retard INTEGER;
  v_rattrapage_heure_prevue INTEGER;
  v_autres INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM medication_intakes;
  
  SELECT COUNT(*) INTO v_pending 
  FROM medication_intakes 
  WHERE notes = 'En attente de traitement';
  
  SELECT COUNT(*) INTO v_taken_normal 
  FROM medication_intakes 
  WHERE notes ~ '^Pris à l''heure, à \d{2}:\d{2}$';
  
  SELECT COUNT(*) INTO v_skipped 
  FROM medication_intakes 
  WHERE notes = 'Prise sautée volontairement';
  
  SELECT COUNT(*) INTO v_missed 
  FROM medication_intakes 
  WHERE notes = 'Rattrapage - Marquée comme manquée';
  
  SELECT COUNT(*) INTO v_rattrapage_pris 
  FROM medication_intakes 
  WHERE notes ~ '^Rattrapage - Marquée comme pris à \d{2}:\d{2}$';
  
  SELECT COUNT(*) INTO v_rattrapage_retard 
  FROM medication_intakes 
  WHERE notes ~ '^Rattrapage - Prise avec retard à \d{2}:\d{2}$';
  
  SELECT COUNT(*) INTO v_rattrapage_heure_prevue 
  FROM medication_intakes 
  WHERE notes ~ '^Rattrapage - Marquée comme pris à l''heure prévue \d{2}:\d{2}$';
  
  v_autres := v_total - (v_pending + v_taken_normal + v_skipped + v_missed + 
                         v_rattrapage_pris + v_rattrapage_retard + v_rattrapage_heure_prevue);
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '   RAPPORT FINAL - NOTES HARMONISÉES';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total enregistrements          : %', v_total;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'En attente de traitement       : %', v_pending;
  RAISE NOTICE 'Pris à l''heure, à HH:mm       : %', v_taken_normal;
  RAISE NOTICE 'Prise sautée volontairement    : %', v_skipped;
  RAISE NOTICE 'Marquée comme manquée          : %', v_missed;
  RAISE NOTICE 'Rattrapage - Marquée comme pris: %', v_rattrapage_pris;
  RAISE NOTICE 'Rattrapage - Prise avec retard : %', v_rattrapage_retard;
  RAISE NOTICE 'Rattrapage - À l''heure prévue : %', v_rattrapage_heure_prevue;
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Autres formats                 : %', v_autres;
  RAISE NOTICE '========================================';
  
  IF v_autres = 0 THEN
    RAISE NOTICE '✅ SUCCÈS : Toutes les notes sont conformes !';
  ELSE
    RAISE WARNING '⚠️  Il reste % notes avec un format non standard', v_autres;
  END IF;
END $$;

-- ====================================================================
-- Si tout est OK, valider la transaction
-- ====================================================================
COMMIT;

-- En cas d'erreur, tout sera annulé automatiquement (ROLLBACK)
