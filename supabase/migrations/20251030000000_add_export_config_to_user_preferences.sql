-- Ajout de la colonne export_config à la table user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS export_config JSONB DEFAULT NULL;

COMMENT ON COLUMN public.user_preferences.export_config IS 'Configuration des exports de profil (format, dates, sections incluses)';
