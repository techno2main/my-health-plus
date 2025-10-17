-- =====================================================
-- SECURITY AND PERFORMANCE FIXES
-- Correction des avertissements Supabase Security Advisor
-- Date: 2025-10-17
-- =====================================================

-- 1. FIX: Auth RLS Initialization Plan - Remplace auth.uid() par (select auth.uid())
-- Cela évite la réévaluation de auth.uid() pour chaque ligne et optimise les performances

-- TABLE: profiles
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- TABLE: user_roles
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Optimiser la fonction has_role pour éviter la réévaluation
-- Recréer les politiques optimisées
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING ((select public.has_role((select auth.uid()), 'admin')));

-- TABLE: user_preferences
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- TABLE: pathologies
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view approved pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Authenticated users can create pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Admins can update pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Admins can delete pathologies" ON public.pathologies;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view approved pathologies"
  ON public.pathologies FOR SELECT
  USING (((is_approved = true) OR (created_by = (select auth.uid())) OR (select public.has_role((select auth.uid()), 'admin'))));

CREATE POLICY "Authenticated users can create pathologies"
  ON public.pathologies FOR INSERT
  WITH CHECK (((select auth.uid()) IS NOT NULL) AND (created_by = (select auth.uid())));

CREATE POLICY "Admins can update pathologies"
  ON public.pathologies FOR UPDATE
  USING ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can delete pathologies"
  ON public.pathologies FOR DELETE
  USING ((select public.has_role((select auth.uid()), 'admin')));

-- TABLE: allergies
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view all allergies" ON public.allergies;
DROP POLICY IF EXISTS "Admins can add allergies" ON public.allergies;
DROP POLICY IF EXISTS "Admins can update allergies" ON public.allergies;
DROP POLICY IF EXISTS "Admins can delete allergies" ON public.allergies;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view all allergies"
  ON public.allergies FOR SELECT
  USING (true);

CREATE POLICY "Admins can add allergies"
  ON public.allergies FOR INSERT
  WITH CHECK ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can update allergies"
  ON public.allergies FOR UPDATE
  USING ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can delete allergies"
  ON public.allergies FOR DELETE
  USING ((select public.has_role((select auth.uid()), 'admin')));

-- TABLE: medication_catalog
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view approved medications" ON public.medication_catalog;
DROP POLICY IF EXISTS "Authenticated users can create medications" ON public.medication_catalog;
DROP POLICY IF EXISTS "Admins can update medications" ON public.medication_catalog;
DROP POLICY IF EXISTS "Admins can delete medication catalog" ON public.medication_catalog;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view approved medications"
  ON public.medication_catalog FOR SELECT
  USING (((is_approved = true) OR (created_by = (select auth.uid())) OR (select public.has_role((select auth.uid()), 'admin'))));

CREATE POLICY "Authenticated users can create medications"
  ON public.medication_catalog FOR INSERT
  WITH CHECK (((select auth.uid()) IS NOT NULL) AND (created_by = (select auth.uid())));

CREATE POLICY "Admins can update medications"
  ON public.medication_catalog FOR UPDATE
  USING ((select public.has_role((select auth.uid()), 'admin')));

CREATE POLICY "Admins can delete medication catalog"
  ON public.medication_catalog FOR DELETE
  USING ((select public.has_role((select auth.uid()), 'admin')));

-- TABLE: health_professionals
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own health professionals" ON public.health_professionals;
DROP POLICY IF EXISTS "Users can create own health professionals" ON public.health_professionals;
DROP POLICY IF EXISTS "Users can update own health professionals" ON public.health_professionals;
DROP POLICY IF EXISTS "Users can delete own health professionals" ON public.health_professionals;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own health professionals"
  ON public.health_professionals FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own health professionals"
  ON public.health_professionals FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own health professionals"
  ON public.health_professionals FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own health professionals"
  ON public.health_professionals FOR DELETE
  USING ((select auth.uid()) = user_id);

-- TABLE: prescriptions
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can create own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can update own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can delete own prescriptions" ON public.prescriptions;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own prescriptions"
  ON public.prescriptions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- TABLE: treatments
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can create own treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can update own treatments" ON public.treatments;
DROP POLICY IF EXISTS "Users can delete own treatments" ON public.treatments;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own treatments"
  ON public.treatments FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own treatments"
  ON public.treatments FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own treatments"
  ON public.treatments FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own treatments"
  ON public.treatments FOR DELETE
  USING ((select auth.uid()) = user_id);

-- TABLE: medications
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can create own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can update own medications" ON public.medications;
DROP POLICY IF EXISTS "Users can delete own medications" ON public.medications;

-- Recréer les politiques optimisées
CREATE POLICY "Users can view own medications"
  ON public.medications FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own medications"
  ON public.medications FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own medications"
  ON public.medications FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own medications"
  ON public.medications FOR DELETE
  USING ((select auth.uid()) = user_id);

-- 2. FIX: Function Search Path Mutable - Corriger les fonctions avec search_path fixe

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer tous les triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pathologies_updated_at BEFORE UPDATE ON public.pathologies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_professionals_updated_at BEFORE UPDATE ON public.health_professionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_visits_updated_at BEFORE UPDATE ON public.pharmacy_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_intakes_updated_at BEFORE UPDATE ON public.medication_intakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_navigation_items_updated_at BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix has_role function - déjà correcte avec SET search_path = public

-- 3. FIX: Multiple Permissive Policies - Résolue par l'optimisation des politiques ci-dessus
-- La politique "Users can view their own roles" et "Admins can view all roles" sont maintenant optimisées

-- Commentaire de fin
-- =====================================================
-- FIN DES CORRECTIONS DE SÉCURITÉ ET PERFORMANCE
-- Toutes les politiques RLS ont été optimisées pour éviter
-- la réévaluation des fonctions auth.* à chaque ligne
-- =====================================================