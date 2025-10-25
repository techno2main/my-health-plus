-- =====================================================
-- Auto-régénération des prises futures (7 jours)
-- Date : 25 octobre 2025
-- Description : Génère automatiquement les 7 prochains 
--               jours de prises quand les horaires changent
-- =====================================================

-- Fonction de régénération des prises futures
CREATE OR REPLACE FUNCTION public.regenerate_future_intakes(med_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Supprimer les prises FUTURES et PENDING uniquement
  DELETE FROM medication_intakes 
  WHERE medication_id = med_id
    AND status = 'pending'
    AND scheduled_time > NOW();
  
  -- Régénérer les 7 prochains jours
  INSERT INTO medication_intakes (medication_id, scheduled_time, status, created_at, updated_at)
  SELECT 
    md.id,
    (intake_date + time_value::time)::timestamp,
    'pending',
    NOW(),
    NOW()
  FROM medications md
  CROSS JOIN generate_series(
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '7 days',
    '1 day'::interval
  ) AS intake_date
  CROSS JOIN LATERAL unnest(md.times) AS time_value
  WHERE md.id = med_id
    AND md.times IS NOT NULL 
    AND array_length(md.times, 1) > 0;
END;
$$;

-- Trigger function pour détecter les changements d'horaires
CREATE OR REPLACE FUNCTION public.auto_regenerate_intakes_on_times_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.times IS DISTINCT FROM OLD.times THEN
    PERFORM regenerate_future_intakes(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS medication_times_changed ON medications;

CREATE TRIGGER medication_times_changed
  AFTER UPDATE OF times ON medications
  FOR EACH ROW
  WHEN (NEW.times IS DISTINCT FROM OLD.times)
  EXECUTE FUNCTION auto_regenerate_intakes_on_times_change();

-- Générer les prises pour tous les médicaments existants
DO $$
DECLARE
  med RECORD;
BEGIN
  FOR med IN SELECT id FROM medications WHERE times IS NOT NULL AND jsonb_array_length(times::jsonb) > 0
  LOOP
    PERFORM regenerate_future_intakes(med.id);
  END LOOP;
END $$;
