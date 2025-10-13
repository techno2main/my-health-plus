-- Sécurisation de la table allergies - réserver aux utilisateurs connectés
DROP POLICY IF EXISTS "Everyone can view allergies" ON public.allergies;

CREATE POLICY "Authenticated users can view allergies"
ON public.allergies
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Sécurisation de la table medication_catalog - réserver aux utilisateurs connectés
DROP POLICY IF EXISTS "Everyone can view medication catalog" ON public.medication_catalog;

CREATE POLICY "Authenticated users can view medication catalog"
ON public.medication_catalog
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);