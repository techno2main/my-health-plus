-- Migration : Autoriser created_by NULL pour les médicaments officiels
-- Date : 11/01/2026
-- Contexte : Import des médicaments officiels ANSM sans créateur

-- Modifier la colonne created_by pour autoriser NULL
ALTER TABLE medication_catalog 
ALTER COLUMN created_by DROP NOT NULL;

-- Vérification
DO $$ 
BEGIN
  RAISE NOTICE 'Migration terminée : created_by peut maintenant être NULL dans medication_catalog';
END $$;
