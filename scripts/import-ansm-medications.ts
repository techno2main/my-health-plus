/**
 * Script d'import des médicaments ANSM dans Supabase
 * Lit les fichiers /datas/CIS_bdpm_utf8.txt et /datas/CIS_COMPO_bdpm_utf8.txt
 * Insère dans la table ansm_medications
 * 
 * Usage: bun run scripts/import-ansm-medications.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

// Configuration Supabase (utilise SERVICE_ROLE_KEY pour bypass RLS)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'MANQUANT');
  console.error('SUPABASE_KEY:', SUPABASE_KEY ? 'OK' : 'MANQUANT');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ANSMMedication {
  code_cis: string;
  name: string;
  form: string;
  administration_route: string;
  amm_status: string;
  commercialization_status: string;
  holder: string;
  substance_active?: string;
}

/**
 * Charge le fichier compositions pour mapper CIS → substance active
 */
function loadCompositions(): Map<string, string> {
  console.log('📖 Chargement des compositions...');
  const filePath = join(process.cwd(), 'datas', 'CIS_COMPO_bdpm_utf8.txt');
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const map = new Map<string, string>();

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const codeCIS = parts[0]?.trim();
    const substance = parts[3]?.trim();
    
    if (codeCIS && substance && !map.has(codeCIS)) {
      map.set(codeCIS, substance.toUpperCase());
    }
  }

  console.log(`✅ ${map.size} compositions chargées`);
  return map;
}

/**
 * Parse le fichier CIS principal
 */
function parseCISFile(compositions: Map<string, string>): ANSMMedication[] {
  console.log('📖 Chargement du fichier CIS...');
  const filePath = join(process.cwd(), 'datas', 'CIS_bdpm_utf8.txt');
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const medications: ANSMMedication[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split('\t');
    if (parts.length < 8) continue;

    const codeCIS = parts[0]?.trim();
    if (!codeCIS) continue;

    medications.push({
      code_cis: codeCIS,
      name: parts[1]?.trim() || '',
      form: parts[2]?.trim() || '',
      administration_route: parts[3]?.trim() || '',
      amm_status: parts[4]?.trim() || '',
      commercialization_status: parts[6]?.trim() || '',
      holder: parts[8]?.trim() || '',
      substance_active: compositions.get(codeCIS),
    });
  }

  console.log(`✅ ${medications.length} médicaments parsés`);
  return medications;
}

/**
 * Extrait le dosage du nom du médicament
 */
function extractStrength(name: string): string | null {
  const match = name.match(/(\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%))/i);
  return match ? match[1].replace(',', '.') : null;
}

/**
 * Insère les médicaments par batch dans Supabase
 */
async function insertMedications(medications: ANSMMedication[]) {
  console.log('💾 Insertion dans Supabase...');
  
  const BATCH_SIZE = 500;
  let totalInserted = 0;
  let errors = 0;

  for (let i = 0; i < medications.length; i += BATCH_SIZE) {
    const batch = medications.slice(i, i + BATCH_SIZE);
    
    const records = batch.map(med => ({
      code_cis: med.code_cis,
      name: med.name,
      form: med.form,
      strength: extractStrength(med.name),
      substance_active: med.substance_active || null,
      administration_route: med.administration_route,
      amm_status: med.amm_status,
      commercialization_status: med.commercialization_status,
      holder: med.holder,
      // pathology_id sera assigné via trigger ou fonction SQL
    }));

    const { error } = await supabase
      .from('ansm_medications')
      .insert(records);

    if (error) {
      console.error(`❌ Erreur batch ${i / BATCH_SIZE + 1}:`, error.message);
      errors++;
    } else {
      totalInserted += batch.length;
      process.stdout.write(`\r✅ Inséré: ${totalInserted}/${medications.length} (${Math.round(totalInserted / medications.length * 100)}%)`);
    }
  }

  console.log(`\n\n✅ Import terminé: ${totalInserted} médicaments`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} batches en erreur`);
  }
}

/**
 * Assigne les pathologies via la fonction SQL
 */
async function assignPathologies() {
  console.log('\n🔗 Attribution des pathologies...');
  
  const { error } = await supabase.rpc('assign_pathologies_to_ansm');
  
  if (error) {
    console.error('❌ Erreur assignation pathologies:', error);
  } else {
    console.log('✅ Pathologies assignées');
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('🚀 Import ANSM → Supabase\n');

  try {
    // 1. Charger les compositions
    const compositions = loadCompositions();

    // 2. Parser le fichier CIS
    const medications = parseCISFile(compositions);

    // 3. Limiter pour test (retirer cette ligne pour import complet)
    // const medicationsToImport = medications.slice(0, 1000);
    const medicationsToImport = medications;

    // 4. Insérer dans Supabase
    await insertMedications(medicationsToImport);

    // 5. Assigner les pathologies
    await assignPathologies();

    console.log('\n✅ Import terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
