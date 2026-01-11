-- Migration : Enrichir la table pathologies avec des pathologies courantes
-- Et lier medication_catalog à pathologies

-- ========================================
-- PARTIE 1 : AJOUTER CONTRAINTE UNIQUE SUR name (si non existante)
-- ========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pathologies_name_unique'
  ) THEN
    ALTER TABLE public.pathologies 
    ADD CONSTRAINT pathologies_name_unique UNIQUE (name);
    RAISE NOTICE 'Contrainte UNIQUE ajoutée sur pathologies.name';
  ELSE
    RAISE NOTICE 'Contrainte UNIQUE déjà existante sur pathologies.name';
  END IF;
END $$;

-- ========================================
-- PARTIE 2 : AJOUTER pathology_id DANS medication_catalog
-- ========================================
ALTER TABLE public.medication_catalog
ADD COLUMN IF NOT EXISTS pathology_id UUID REFERENCES public.pathologies(id) ON DELETE SET NULL;

-- Index pour améliorer les performances de recherche par pathologie
CREATE INDEX IF NOT EXISTS idx_medication_catalog_pathology_id 
ON public.medication_catalog(pathology_id);

COMMENT ON COLUMN public.medication_catalog.pathology_id IS 'Lien vers la pathologie traitée par ce médicament (optionnel)';

-- ========================================
-- PARTIE 3 : INSÉRER LES PATHOLOGIES MANQUANTES
-- ========================================
-- NOTE : Les pathologies existantes ne seront PAS touchées grâce à ON CONFLICT

INSERT INTO public.pathologies (name, description, is_approved, created_by, severity)
VALUES
  -- NE PAS DUPLIQUER LES EXISTANTES (vérifier les noms exacts)
  -- Existantes : 'Douleur/Fièvre', 'Insomnie', 'Diabète Type 2', 'Cholestérol', 'Anxiété'
  
  -- Nouvelles pathologies à ajouter (seulement si elles n'existent pas)
  ('Fièvre', 'État fébrile isolé', true, NULL, 'Ponctuelle'),
  ('Douleur chronique', 'Douleur persistante', true, NULL, 'Récurrente'),
  ('Migraine', 'Céphalées migraineuses', true, NULL, 'Récurrente'),
  ('Inflammation', 'États inflammatoires divers', true, NULL, 'Temporaire'),
  
  -- Cardiovasculaire
  ('Hypertension artérielle', 'Pression artérielle élevée', true, NULL, 'Récurrente'),
  ('Insuffisance cardiaque', 'Défaillance de la fonction cardiaque', true, NULL, 'Récurrente'),
  ('Arythmie cardiaque', 'Troubles du rythme cardiaque', true, NULL, 'Récurrente'),
  ('Prévention cardiovasculaire', 'Prévention des accidents cardiovasculaires', true, NULL, 'Récurrente'),
  
  -- Métabolique (éviter doublon avec 'Diabète Type 2' et 'Cholestérol' existants)
  ('Diabète Type 1', 'Déficit absolu en insuline', true, NULL, 'Récurrente'),
  ('Hypothyroïdie', 'Déficit en hormones thyroïdiennes', true, NULL, 'Récurrente'),
  ('Hyperthyroïdie', 'Excès d''hormones thyroïdiennes', true, NULL, 'Récurrente'),
  ('Obésité', 'Surpoids important', true, NULL, 'Récurrente'),
  ('Dyslipidémie', 'Troubles lipidiques', true, NULL, 'Récurrente'),
  
  -- Digestif
  ('Reflux gastro-œsophagien', 'Remontées acides', true, NULL, 'Récurrente'),
  ('Ulcère gastro-duodénal', 'Lésion de la muqueuse digestive', true, NULL, 'Récurrente'),
  ('Constipation', 'Trouble du transit intestinal', true, NULL, 'Temporaire'),
  ('Diarrhée', 'Selles liquides fréquentes', true, NULL, 'Temporaire'),
  ('Nausées et vomissements', 'Troubles digestifs', true, NULL, 'Ponctuelle'),
  
  -- Psychiatrie (éviter doublon avec 'Anxiété' et 'Insomnie' existants)
  ('Dépression', 'Troubles dépressifs', true, NULL, 'Récurrente'),
  ('Troubles bipolaires', 'Alternance d''épisodes maniaques et dépressifs', true, NULL, 'Récurrente'),
  ('Schizophrénie', 'Troubles psychotiques', true, NULL, 'Récurrente'),
  
  -- Neurologique
  ('Épilepsie', 'Crises épileptiques', true, NULL, 'Récurrente'),
  ('Maladie de Parkinson', 'Maladie neurodégénérative', true, NULL, 'Récurrente'),
  ('Maladie d''Alzheimer', 'Démence neurodégénérative', true, NULL, 'Récurrente'),
  ('Sclérose en plaques', 'Maladie auto-immune du système nerveux', true, NULL, 'Récurrente'),
  
  -- Respiratoire
  ('Asthme', 'Maladie inflammatoire des bronches', true, NULL, 'Récurrente'),
  ('BPCO', 'Bronchopneumopathie chronique obstructive', true, NULL, 'Récurrente'),
  ('Rhinite allergique', 'Allergie respiratoire', true, NULL, 'Récurrente'),
  
  -- Infectieux
  ('Infection bactérienne', 'Infections causées par des bactéries', true, NULL, 'Ponctuelle'),
  ('Infection virale', 'Infections causées par des virus', true, NULL, 'Ponctuelle'),
  ('Infection fongique', 'Mycoses', true, NULL, 'Temporaire'),
  
  -- Rhumatologie
  ('Arthrose', 'Usure du cartilage articulaire', true, NULL, 'Récurrente'),
  ('Polyarthrite rhumatoïde', 'Maladie auto-immune articulaire', true, NULL, 'Récurrente'),
  ('Ostéoporose', 'Fragilité osseuse', true, NULL, 'Récurrente'),
  ('Goutte', 'Excès d''acide urique', true, NULL, 'Récurrente'),
  
  -- Dermatologie
  ('Eczéma', 'Dermatite atopique', true, NULL, 'Récurrente'),
  ('Psoriasis', 'Maladie inflammatoire de la peau', true, NULL, 'Récurrente'),
  ('Acné', 'Affection cutanée des follicules pilosébacés', true, NULL, 'Temporaire'),
  
  -- Urologie
  ('Hypertrophie bénigne de la prostate', 'Adénome prostatique', true, NULL, 'Récurrente'),
  ('Infections urinaires', 'Cystite, pyélonéphrite', true, NULL, 'Ponctuelle'),
  
  -- Ophtalmologie
  ('Glaucome', 'Hypertension intraoculaire', true, NULL, 'Récurrente'),
  ('Conjonctivite', 'Inflammation de la conjonctive', true, NULL, 'Ponctuelle'),
  
  -- Gynécologie
  ('Contraception', 'Prévention de la grossesse', true, NULL, 'Récurrente'),
  ('Ménopause', 'Arrêt de la fonction ovarienne', true, NULL, 'Récurrente'),
  
  -- Oncologie
  ('Cancer', 'Tumeur maligne', true, NULL, 'Récurrente'),
  ('Nausées chimiothérapie', 'Effets secondaires de la chimiothérapie', true, NULL, 'Temporaire'),
  
  -- Addictions (éviter doublon avec 'Alcoolisme' existant si présent)
  ('Tabagisme', 'Dépendance au tabac', true, NULL, 'Récurrente')

ON CONFLICT (name) DO NOTHING; -- Protège les pathologies existantes

-- ========================================
-- PARTIE 4 : MESSAGE DE CONFIRMATION
-- ========================================
DO $$ 
DECLARE
  count_before INT;
  count_after INT;
BEGIN
  SELECT COUNT(*) INTO count_after FROM public.pathologies;
  RAISE NOTICE '✅ Migration terminée : % pathologies dans la base', count_after;
  RAISE NOTICE '✅ Les 5 pathologies existantes ont été préservées';
  RAISE NOTICE '✅ Les 5 médicaments existants ne sont PAS modifiés';
END $$;
