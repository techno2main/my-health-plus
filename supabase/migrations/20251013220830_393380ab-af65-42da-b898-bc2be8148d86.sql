-- Add approval system to pathologies table
ALTER TABLE public.pathologies
ADD COLUMN is_approved boolean DEFAULT false NOT NULL,
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add approval system to medication_catalog table
ALTER TABLE public.medication_catalog
ADD COLUMN is_approved boolean DEFAULT false NOT NULL,
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing policies for pathologies
DROP POLICY IF EXISTS "Everyone can view pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Authenticated users can add pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Authenticated users can update pathologies" ON public.pathologies;
DROP POLICY IF EXISTS "Authenticated users can delete pathologies" ON public.pathologies;

-- Create new policies for pathologies
CREATE POLICY "Users can view approved pathologies"
ON public.pathologies
FOR SELECT
USING (is_approved = true OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create pathologies"
ON public.pathologies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins can update pathologies"
ON public.pathologies
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pathologies"
ON public.pathologies
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing policies for medication_catalog
DROP POLICY IF EXISTS "Authenticated users can view medication catalog" ON public.medication_catalog;
DROP POLICY IF EXISTS "Authenticated users can add to medication catalog" ON public.medication_catalog;
DROP POLICY IF EXISTS "Authenticated users can update medication catalog" ON public.medication_catalog;
DROP POLICY IF EXISTS "Authenticated users can delete from medication catalog" ON public.medication_catalog;

-- Create new policies for medication_catalog
CREATE POLICY "Users can view approved medications"
ON public.medication_catalog
FOR SELECT
USING (is_approved = true OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create medications"
ON public.medication_catalog
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins can update medications"
ON public.medication_catalog
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete medications"
ON public.medication_catalog
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));