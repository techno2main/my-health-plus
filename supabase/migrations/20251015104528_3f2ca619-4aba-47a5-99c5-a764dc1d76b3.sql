-- Ajouter une colonne pour stocker la date réelle de visite
ALTER TABLE pharmacy_visits 
ADD COLUMN actual_visit_date DATE;

COMMENT ON COLUMN pharmacy_visits.actual_visit_date IS 'Date réelle de la visite à la pharmacie (peut différer de la date planifiée)';