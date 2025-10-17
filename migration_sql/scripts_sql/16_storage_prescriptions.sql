-- Script pour configurer le bucket prescriptions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Mettre à jour le bucket prescriptions pour le rendre public et configurer les limites
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB limit pour les documents
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'image/tiff'
  ]
WHERE id = 'prescriptions';

-- 2. Si le bucket n'existe pas, le créer
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf',
    'image/tiff'
  ]
)
ON CONFLICT (id) DO NOTHING;