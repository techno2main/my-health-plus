-- =====================================================
-- TABLE: public.user_roles
-- Rôles des utilisateurs (admin/user)
-- =====================================================

-- ENUM pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- STRUCTURE
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- DONNÉES: Rôle admin Tyson Nomansa uniquement
INSERT INTO public.user_roles VALUES
('3d9a32f2-6c68-4ebb-9cb7-af7c0e6b2112', '40f221e1-3fcb-4b03-b9b2-5bf8142a37cb', 'admin', '2025-10-13 22:01:20.408837+00');