
-- Ajouter 'laboratory' comme type valide pour health_professionals
ALTER TABLE health_professionals DROP CONSTRAINT IF EXISTS health_professionals_type_check;
ALTER TABLE health_professionals ADD CONSTRAINT health_professionals_type_check 
  CHECK (type IN ('doctor', 'pharmacy', 'laboratory'));
