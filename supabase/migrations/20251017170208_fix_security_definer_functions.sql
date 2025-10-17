-- =====================================================
-- FIX SECURITY DEFINER FUNCTIONS - search_path
-- Correction des fonctions SECURITY DEFINER avec search_path fixe
-- Date: 2025-10-17
-- =====================================================

-- 1. FIX: has_role fonction - S'assurer qu'elle a le search_path fixe
DROP FUNCTION IF EXISTS public.has_role(UUID, app_role) CASCADE;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. FIX: update_updated_at_column fonction - S'assurer qu'elle a le search_path fixe  
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Recréer tous les triggers qui utilisent update_updated_at_column
-- (pour s'assurer qu'ils utilisent la nouvelle fonction)

-- Profiles trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles trigger  
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User preferences trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pathologies trigger
DROP TRIGGER IF EXISTS update_pathologies_updated_at ON public.pathologies;
CREATE TRIGGER update_pathologies_updated_at
  BEFORE UPDATE ON public.pathologies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allergies trigger
DROP TRIGGER IF EXISTS update_allergies_updated_at ON public.allergies;
CREATE TRIGGER update_allergies_updated_at
  BEFORE UPDATE ON public.allergies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medication catalog trigger
DROP TRIGGER IF EXISTS update_medication_catalog_updated_at ON public.medication_catalog;
CREATE TRIGGER update_medication_catalog_updated_at
  BEFORE UPDATE ON public.medication_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health professionals trigger
DROP TRIGGER IF EXISTS update_health_professionals_updated_at ON public.health_professionals;
CREATE TRIGGER update_health_professionals_updated_at
  BEFORE UPDATE ON public.health_professionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prescriptions trigger
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Treatments trigger
DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medications trigger
DROP TRIGGER IF EXISTS update_medications_updated_at ON public.medications;
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pharmacy visits trigger
DROP TRIGGER IF EXISTS update_pharmacy_visits_updated_at ON public.pharmacy_visits;
CREATE TRIGGER update_pharmacy_visits_updated_at
  BEFORE UPDATE ON public.pharmacy_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medication intakes trigger
DROP TRIGGER IF EXISTS update_medication_intakes_updated_at ON public.medication_intakes;
CREATE TRIGGER update_medication_intakes_updated_at
  BEFORE UPDATE ON public.medication_intakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vérification que les fonctions sont correctement configurées
DO $$
BEGIN
  -- Vérifier has_role
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'has_role'
    AND p.prosecdef = TRUE
    AND 'public' = ANY(string_to_array(p.proconfig[1], '='))[2]
  ) THEN
    RAISE EXCEPTION 'Function has_role is not properly configured with SECURITY DEFINER and search_path';
  END IF;

  -- Vérifier update_updated_at_column
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'update_updated_at_column'
    AND p.prosecdef = TRUE
    AND 'public' = ANY(string_to_array(p.proconfig[1], '='))[2]
  ) THEN
    RAISE EXCEPTION 'Function update_updated_at_column is not properly configured with SECURITY DEFINER and search_path';
  END IF;

  RAISE NOTICE 'All SECURITY DEFINER functions are correctly configured with fixed search_path';
END
$$;
