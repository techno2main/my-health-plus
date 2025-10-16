-- Corriger la date de début de l'ordonnance et du traitement DT2-CHL au 07/10/2025
UPDATE prescriptions
SET prescription_date = '2025-10-07'
WHERE id = '9de5ad44-925e-40bf-8916-f0935b190356';

UPDATE treatments
SET start_date = '2025-10-07',
    end_date = ('2025-10-07'::date + INTERVAL '1 day' * 90)::date
WHERE prescription_id = '9de5ad44-925e-40bf-8916-f0935b190356';