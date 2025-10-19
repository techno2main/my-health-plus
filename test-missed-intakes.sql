-- Script temporaire pour tester la logique de détection des prises manquées
-- On supprime les 2 prises skipped pour simuler des prises vraiment manquées

BEGIN;

-- Sauvegarder l'état actuel pour pouvoir restaurer
SELECT 
    id,
    medication_id,
    scheduled_time,
    status,
    'AVANT MODIFICATION' as etat
FROM medication_intakes 
WHERE DATE(scheduled_time) = '2025-10-18' 
AND status = 'skipped';

-- Supprimer les 2 prises marquées skipped du 18/10
-- (Quviviq et Venlafaxine à 22:30 et 20:00)
DELETE FROM medication_intakes 
WHERE DATE(scheduled_time) = '2025-10-18' 
AND status = 'skipped';

-- Vérifier le résultat
SELECT 
    DATE(scheduled_time) as date_prise,
    status,
    COUNT(*) as nombre
FROM medication_intakes 
WHERE DATE(scheduled_time) >= '2025-10-18'
GROUP BY DATE(scheduled_time), status
ORDER BY date_prise DESC, status;

COMMIT;

-- Pour restaurer après les tests, utilisez :
-- INSERT INTO medication_intakes (medication_id, scheduled_time, status) VALUES
-- ('98a396ee-051d-4531-bb26-62fe0ccc57e3', '2025-10-18 20:30:00+00', 'skipped'),
-- ('eb3b4d05-b031-4bae-a212-a40087bb28f0', '2025-10-18 20:00:00+00', 'skipped');