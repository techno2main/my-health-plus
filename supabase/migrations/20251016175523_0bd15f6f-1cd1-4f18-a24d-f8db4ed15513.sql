-- Corriger les dates de fin des traitements existants en fonction du QSP de leur prescription
UPDATE treatments 
SET end_date = (start_date + INTERVAL '1 day' * (
  SELECT duration_days 
  FROM prescriptions 
  WHERE id = treatments.prescription_id
))::date
WHERE prescription_id IS NOT NULL AND end_date IS NOT NULL;