-- =====================================================
-- TABLE: public.user_preferences
-- Préférences utilisateur (biométrie, 2FA, etc.)
-- =====================================================

-- STRUCTURE
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    biometric_enabled BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TRIGGER pour mise à jour automatique
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DONNÉES: Préférences Tyson Nomansa (biométrie activée)
INSERT INTO public.user_preferences VALUES
('239fb453-1f32-4db9-83e8-979e950d5c96', '40f221e1-3fcb-4b03-b9b2-5bf8142a37cb', true, false, '2025-10-15 21:56:39.334379+00', '2025-10-15 21:59:58.438219+00');